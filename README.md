## What is Maybe-Resumable.js ?

A JavaScript library which extends Resumable.js and allows to use not resumable uploads for older browsers, such as IE7, IE8 and IE9.

This library is written in the same style as Resumable.js and follows same api. This means that with
minimal effort we can have both: awesome [Resumable.js](https://github.com/resumable2/resumable.js) features and support for older browsers.


## How can I use it?

Same as Resumable.js, except of calling Resumable constructor we call maybeResumable function.
This function automatically checks if Resumable.js is supported.

    var uploader = maybeResumable({
      target:'/api/photo/redeem-upload-token', 
      query:{upload_token:'my_token'}
    });
    
`uploader` is going to be instance of `Resumable` if it is supported, otherwise instance of `NotResumable` will be returned. 

## NotResumable

This library has same methods and properties as `Resumable` except it handles not resumable uploads.
Additional options:
 * matchJSON - removes html from returned response on fileSuccess event. Default false.

## NotResumableFile

File is instance of `NotResumableFile`. It has same methods and properties as `ResumableFile`.

Differences in properties:
 * size - undefined
 * uniqueIdentifier - is generated in uuid format
 * progress - equals to 0 or 1
 * chunks - undefined
 * file - undefined

Differences in methods:
 * getType - returns undefined
 * timeRemaining - returns undefined
 * sizeUploaded - returns undefined

## Build

[Download minified, only 18kb](https://raw.github.com/resumable2/maybe-resumable.js/master/build/maybe-resumable.min.js)
[Download for development](https://raw.github.com/resumable2/maybe-resumable.js/master/build/maybe-resumable.js)
