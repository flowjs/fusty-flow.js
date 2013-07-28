/*
 * MIT Licensed
 * http://github.com/aidask/maybe-resumable.js
 * Aidas Klimas
 */
"use strict";
var NotResumable = function(opts){
    if ( !(this instanceof NotResumable) ) {
        return new NotResumable( opts );
    }
    // All browsers should support this
    this.support = true;

    // PROPERTIES
    var $ = this;
    $.files = [];
    $.defaults = {
        simultaneousUploads:3,
        fileParameterName:'file',
        paramNames: {
            resumableFilename:'resumableFilename',
            resumableRelativePath:'resumableRelativePath',
            resumableIdentifier:'resumableIdentifier'
        },
        query:{},
        target:'/',
        generateUniqueIdentifier:null
    };
    $.opts = opts||{};
    $.getOpt = function(o) {
        var $this = this;
        // Get multiple option if passed an array
        if (o instanceof Array) {
            var options = {};
            $h.each(o, function(option){
                options[option] = $this.getOpt(option);
            });
            return options;
        }
        // Otherwise, just return a simple option
        if ($this instanceof NotResumableFile) {
            if (typeof $this.opts[o] !== 'undefined') {
                return $this.opts[o];
            } else {
                $this = $this.resumableObj;
            }
        }
        if ($this instanceof NotResumable) {
            if (typeof $this.opts[o] !== 'undefined') {
                return $this.opts[o];
            } else {
                return $this.defaults[o];
            }
        }
    };

    // EVENTS
    // catchAll(event, ...)
    // fileSuccess(file), fileProgress(file), fileAdded(file, event), fileRetry(file), fileError(file, message),
    // complete(), progress(), error(message, file), pause()
    $.events = [];
    $.on = function(event,callback){
        $.events.push(event.toLowerCase(), callback);
    };
    $.fire = function() {
        // `arguments` is an object, not array, in FF, so:
        var args = [];
        for (var i=0; i<arguments.length; i++) args.push(arguments[i]);
        // Find event listeners, and support pseudo-event `catchAll`
        var event = args[0].toLowerCase();
        for (var i=0; i<=$.events.length; i+=2) {
            if($.events[i]==event) $.events[i+1].apply($,args.slice(1));
            if($.events[i]=='catchall') $.events[i+1].apply(null,args);
        }
        if(event=='fileerror') $.fire('error', args[2], args[1]);
        if(event=='fileprogress') $.fire('progress');
    };

    // INTERNAL HELPER METHODS (handy, but ultimately not part of uploading)
    var $h = {
        stopEvent: function(e) {
            e.stopPropagation();
            e.preventDefault();
        },
        each: function(o, callback){
            if(o && typeof(o.length)!=='undefined') {
                for (var i=0; i<o.length; i++) {
                    // Array or FileList
                    if(callback(o[i])===false) return;
                }
            } else {
                for (i in o) {
                    // Object
                    if(callback(i,o[i])===false) return;
                }
            }
        },
        generateUniqueIdentifier:function(element) {
            var custom = $.getOpt('generateUniqueIdentifier');
            if(typeof custom === 'function') {
                return custom(element);
            }
            return 'xxxxxxxx-xxxx-yxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        },
        addEvent:function(element, type, handler) {
            if (element.addEventListener) {
                element.addEventListener(type, handler, false);
            } else if (element.attachEvent) {
                element.attachEvent("on" + type, handler);
            } else {
                element["on" + type] = handler;
            }
        },
        removeEvent: function(element, type, handler) {
            if (element.removeEventListener) {
                element.removeEventListener(type, handler, false);
            } else if (element.detachEvent) {
                element.detachEvent("on" + type, handler);
            } else {
                element["on" + type] = null;
            }
        },
        removeElement: function(element) {
            element.parentNode.removeChild(element);
        },
        parseJson: function(json) {
            if (window.JSON) {
                return JSON.parse(json);
            } else {
                return eval("(" + json + ")");
            }
        },
        isFunction: function(functionToCheck) {
            var getType = {};
            return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
        }
    };

    // INTERNAL OBJECT TYPES
    function NotResumableFile(resumableObj, element) {
        var $ = this;
        $.opts = {};
        $.getOpt = resumableObj.getOpt;
        $.resumableObj = resumableObj;
        $.element = element;
        $.fileName = element.value && element.value.replace(/.*(\/|\\)/, "");
        $.size = null;
        $.relativePath = $.fileName;
        $.uniqueIdentifier = $h.generateUniqueIdentifier(element);
        $.iFrame = null;

        var finished = false;
        var _error = false;

        function createIframe() {
            var iFrame = (/MSIE (6|7|8)/).test(navigator.userAgent) ?
                document.createElement('<iframe name="' + $.uniqueIdentifier + '_iframe' + '">'):
                document.createElement('iframe');

            iFrame.setAttribute('id', $.uniqueIdentifier + '_iframe_id');
            iFrame.setAttribute('name', $.uniqueIdentifier + '_iframe');
            iFrame.style.display = 'none';
            document.body.appendChild(iFrame);
            return iFrame;
        }
        function createForm() {
            var o = $.getOpt(['target']);
            var form = document.createElement('form');
            form.encoding = "multipart/form-data";
            form.method = "POST";
            form.setAttribute('action', o.target);
            if (!$.iFrame) {
                $.iFrame = createIframe();
            }
            form.setAttribute('target', $.iFrame.name);
            form.style.display = 'none';
            document.body.appendChild(form);
            return form;
        }
        function addFormParams(form, params) {
            var input;
            $h.each(params, function (key, value) {
                if (value && value.nodeType === 1) {
                    input = value;
                } else {
                    input = document.createElement('input');
                    input.setAttribute('value', value);
                }
                input.setAttribute('name', key);
                form.appendChild(input);
            })
        }
        function iFrameLoaded(event) {
            // when we remove iframe from dom
            // the request stops, but in IE load
            // event fires
            if (!$.iFrame || !$.iFrame.parentNode){
                return;
            }
            try {
                // fixing Opera 10.53
                if ($.iFrame.contentDocument &&
                    $.iFrame.contentDocument.body &&
                    $.iFrame.contentDocument.body.innerHTML == "false"){
                    // In Opera event is fired second time
                    // when body.innerHTML changed from false
                    // to server response approx. after 1 sec
                    // when we upload file with iframe
                    return;
                }
            } catch (error) {
                //IE may throw an "access is denied" error when attempting to access contentDocument
                _error = true;
                $.resumableObj.fire('fileError', $, error);
            }
            // iframe.contentWindow.document - for IE<7
            var doc = $.iFrame.contentDocument || $.iFrame.contentWindow.document,
                innerHtml = doc.body.innerHTML;
            $.abort();
            finished = true;
            $.resumableObj.fire('fileSuccess', $, innerHtml);
            $.resumableObj.upload();
        }
        $.abort = function() {
            if ($.iFrame) {
                $.iFrame.setAttribute('src', 'java' + String.fromCharCode(115) + 'cript:false;');
                $h.removeElement($.iFrame);
                $.iFrame = null;
            }
            $.resumableObj.fire('fileProgress', $);
        };
        $.cancel = function() {
            $.abort();
            $.resumableObj.removeFile($);
            $.resumableObj.fire('fileProgress', $);
        };
        $.retry = function() {
            $.bootstrap();
            $.resumableObj.upload();
        };
        $.bootstrap = function() {
            $.abort();
            _error = false;
        };
        $.progress = function() {
            if(_error) {
                return 1;
            }
            return finished ? 1 : 0;
        };
        $.isUploading = function() {
            return $.iFrame !== null;
        };
        $.sizeUploaded = function(){
            return null;
        };
        $.timeRemaining = function(){
            return null;
        };
        $.send = function () {
            if (finished) {
                return ;
            }
            var o = $.getOpt(['query', 'fileParameterName', 'paramNames']);
            var form = createForm();
            var params = o.query;
            if($h.isFunction(params)) params = params($);
            params[o.fileParameterName] = $.element;
            params[o.paramNames.resumableFilename] = $.fileName;
            params[o.paramNames.resumableRelativePath] = $.relativePath;
            params[o.paramNames.resumableIdentifier] = $.uniqueIdentifier;

            addFormParams(form, params);
            $.resumableObj.fire('fileProgress', $);
            $h.addEvent($.iFrame, 'load', iFrameLoaded);
            form.submit();
            $h.removeElement(form);
        };
        // Bootstrap and return
        $.bootstrap();
        return this;
    }


    // INTERNAL METHODS
    var appendFilesFromDomElements = function(elementsList, event) {
        // check for uploading too many files
        var errorCount = 0;
        var o = $.getOpt(['maxFiles', 'maxFilesErrorCallback']);
        if (typeof(o.maxFiles)!=='undefined' && o.maxFiles < (elementsList.length + $.files.length)) {
            // if single-file upload, file is already added, and trying to add 1 new file,
            // simply replace the already-added file
            if (o.maxFiles===1 && $.files.length===1 && elementsList.length===1) {
                $.removeFile($.files[0]);
            } else {
                o.maxFilesErrorCallback(elementsList, errorCount++);
                return false;
            }
        }
        var files = [];
        $h.each(elementsList, function(element) {
            if (element.value) {
                var f = new NotResumableFile($, element);
                $.files.push(f);
                files.push(f);
                $.fire('fileAdded', f, event);
            }
        });
        $.fire('filesAdded', files);
    };
    var inputChangeEvent = function (event) {
        var input = event.srcElement;
        $h.removeEvent(input, 'change', inputChangeEvent);
        $.addFile(input, event);
        var newClone = input.cloneNode();
        // change current input with new one
        input.parentNode.replaceChild(newClone, input);
        // reset new input
        newClone.value = '';
        $h.addEvent(newClone, 'change', inputChangeEvent);
    };

    // PUBLIC METHODS FOR RESUMABLE.JS
    $.assignBrowse = function(domNodes) {
        if(typeof(domNodes.length)=='undefined') domNodes = [domNodes];
        $h.each(domNodes, function(domNode) {
            var input;
            if(domNode.tagName==='INPUT' && domNode.type==='file'){
                input = domNode;
            } else {
                input = document.createElement('input');
                input.setAttribute('type', 'file');
                // Place <input /> with the dom node an position the input to fill the entire space
                domNode.style.display = 'inline-block';
                domNode.style.position = 'relative';
                input.style.position = 'absolute';
                input.style.top = input.style.left = input.style.bottom = input.style.right = 0;
                input.style.opacity = 0;
                input.style.cursor = 'pointer';
                domNode.appendChild(input);
            }
            // When new files are added, simply append them to the overall list
            $h.addEvent(input, 'change', inputChangeEvent);
        });
    };
    $.assignDrop = function(domNodes) {
        // not supported
    };
    $.unAssignDrop = function(domNodes) {
        // not supported
    };
    $.isUploading = function() {
        var uploading = false;
        $h.each($.files, function(file){
            if (file.isUploading()) {
                uploading = true;
                return false;
            }
        });
        return uploading;
    };
    $.upload = function() {
        // Kick off the queue
        var files = 0;
        $h.each($.files, function (file) {
            if (file.progress() == 1) {
                return ;
            }
            if (file.isUploading()) {
                files++;
                return ;
            }
            if (files++ >= $.getOpt('simultaneousUploads'))  {
                return false;
            }
            if (files==1) {
                $.fire('uploadStart');
            }
            file.send();
        });
        if (!files) {
            $.fire('complete');
        }
    };
    $.pause = function() {
        $h.each($.files, function(file){
            file.abort();
        });
        $.fire('pause');
    };
    $.cancel = function(){
        $h.each($.files, function(file){
            file.cancel();
        });
        $.fire('cancel');
    };
    $.progress = function(){
        var totalDone = 0;
        var totalFiles = 0;
        $h.each($.files, function(file) {
            totalDone += file.progress();
            totalFiles++;
        });
        return(totalSize>0 ? totalDone/totalFiles : 0);
    };
    $.addFile = function(file, event) {
        // is domElement ?
        if (file.nodeType === 1) {
            appendFilesFromDomElements([file], event);
        }
    };
    $.removeFile = function(file){
        var files = [];
        $h.each($.files, function(f,i){
            if(f!==file) files.push(f);
        });
        $.files = files;
    };
    $.getFromUniqueIdentifier = function(uniqueIdentifier){
        var ret = false;
        $h.each($.files, function(f){
            if(f.uniqueIdentifier==uniqueIdentifier) ret = f;
        });
        return ret;
    };
    $.getSize = function(){
        return null;
    };
    return this;
};

// Node.js-style export for Node and Component
if(typeof module != 'undefined') {
    module.exports = NotResumable;
}