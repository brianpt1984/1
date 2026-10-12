---
title: "forEach(callback)"
layout: default
section: api
---

Call a callback function for each entry at this folder level.

__Returns__ : Nothing.

__Since__: v3.0.0

## Arguments

name      | type     | description
----------|----------|------------
callback  | function | the callback to use.

The callback has the following signature : `function (file, relativePath) {...}` :

name         | type      | description
-------------|-----------|------------
file         | ZipObject | the current file. See [ZipObject]({{site.baseurl}}/documentation/api_zipobject.html).
relativePath | string    | the filename and its path, relative to the current folder.


## Examples

```js
var zip = new JSZip();
zip.file("package.json", "...");
zip.file("lib/index.js", "...");
zip.file("test/index.html", "...");
zip.file("test/asserts/file.js", "...");
zip.file("test/asserts/generate.js", "...");

zip.folder("test").forEach(function (file, relativePath){
    console.log("iterating over", relativePath);
});

// will display:
// iterating over index.html
// iterating over asserts/
// iterating over asserts/file.js
// iterating over asserts/generate.js
```
