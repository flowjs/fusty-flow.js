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