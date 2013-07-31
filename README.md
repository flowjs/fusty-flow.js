## What is Maybe-Resumable.js ?

A JavaScript library which extends Resumable.js and allows to use not resumable uploads for older browsers.


## How can I use it?

Same as Resumable.js except of calling Resumable function we call MaybeResumable.

    var uploader = new MaybeResumable({
      target:'/api/photo/redeem-upload-token', 
      query:{upload_token:'my_token'}
    });
    
`uploader` is going to be instance of `Resumable` if it is supported, otherwise instance of `NotResumable` will be returned. 

## NotResumable

This library has same methods and properties as Resumable except it handles not resumable uploads and supports IE 7 - and greater browsers.

## NotResumableFile

Files are instance of `NotResumableFile`. It has same methods and properties as ResumableFile.

Differences in properties:
 * size - always equals to null
 * uniqueIdentifier - is generated in uuid format
 * progress - equals to 0 or 1
 * sizeUploaded - always equals to null
 * timeRemaining - always equals to null
 * chunks - undefined
 * file - undefined
