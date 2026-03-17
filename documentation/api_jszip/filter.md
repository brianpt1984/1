---
title: "filter(predicate)"
layout: default
section: api
---

Filter nested files/folders with the specified function.

__Returns__ : An array of matching ZipObject.

__Since__: v1.0.0

## Arguments

name      | type     | description
----------|----------|------------
predicate | function | the predicate to use.

The predicate has the following signature : `function (file, relativePath) {...}` :

name         | type      | description
-------------|-----------|------------
file         | ZipObject | the file being tested. See [ZipObject]({{site.baseurl}}/documentation/api_zipobject.html).
relativePath | string    | the filename and its path, relative to the current folder.

The predicate must return true if the file should be included, false otherwise.


## Examples

```js
var zip = new JSZip().folder("dir");
zip.file("readme.txt", "content");
zip.filter(function (file, relativePath){
  // relativePath == "readme.txt"
  // file = {name:"dir/readme.txt",options:{...},async:function}
  return true/false;
});
```


