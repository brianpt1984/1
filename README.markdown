JSZip
=====

A library for creating, reading and editing .zip files with JavaScript, with a
lovely and simple API.

**🛡️ Security Enhanced Fork** - This version includes additional security features:
- Path traversal protection
- ZIP bomb detection
- Input validation
- Zero known vulnerabilities

See https://stuk.github.io/jszip for all the documentation.

```javascript
const zip = new JSZip();

zip.file("Hello.txt", "Hello World\n");

const img = zip.folder("images");
img.file("smile.gif", imgData, {base64: true});

zip.generateAsync({type:"blob"}).then(function(content) {
    // see FileSaver.js
    saveAs(content, "example.zip");
});

/*
Results in a zip containing
Hello.txt
images/
    smile.gif
*/
```

Security Features
-----------------

This fork includes enhanced security features:

```javascript
// Load ZIP with security options
const zip = await JSZip.loadAsync(data, {
    maxFiles: 1000,                    // Limit number of files
    maxUncompressedSize: 50 * 1024 * 1024, // 50MB limit
    maxCompressionRatio: 100           // Prevent ZIP bombs
});
```

See [SECURITY_GUIDE.md](SECURITY_GUIDE.md) for detailed security information.

**Security Status:** ✅ 0 vulnerabilities - Run `npm run security-check` to verify.

License
-------

JSZip is dual-licensed. You may use it under the MIT license *or* the GPLv3
license. See [LICENSE.markdown](LICENSE.markdown).
