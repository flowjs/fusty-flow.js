/*
 * MIT Licensed
 * http://github.com/aidask/maybe-resumable.js
 * Aidas Klimas
 */
"use strict";
var MaybeResumable = function(opts) {
    var resumable = new Resumable(opts);
    if (resumable.support) {
        return resumable;
    }
    return new NotResumable(opts);
};

// Node.js-style export for Node and Component
if(typeof module != 'undefined') {
    module.exports = MaybeResumable;
}