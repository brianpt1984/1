"use strict";
var utils = require("./utils");
var external = require("./external");
var utf8 = require("./utf8");
var ZipEntries = require("./zipEntries");
var Crc32Probe = require("./stream/Crc32Probe");
var nodejsUtils = require("./nodejsUtils");

/**
 * Check the CRC32 of an entry.
 * @param {ZipEntry} zipEntry the zip entry to check.
 * @return {Promise} the result.
 */
function checkEntryCRC32(zipEntry) {
    return new external.Promise(function (resolve, reject) {
        var worker = zipEntry.decompressed.getContentWorker().pipe(new Crc32Probe());
        worker.on("error", function (e) {
            reject(e);
        })
            .on("end", function () {
                if (worker.streamInfo.crc32 !== zipEntry.decompressed.crc32) {
                    reject(new Error("Corrupted zip : CRC32 mismatch"));
                } else {
                    resolve();
                }
            })
            .resume();
    });
}

module.exports = function (data, options) {
    var zip = this;
    options = utils.extend(options || {}, {
        base64: false,
        checkCRC32: false,
        optimizedBinaryString: false,
        createFolders: false,
        decodeFileName: utf8.utf8decode,
        // Security options
        maxUncompressedSize: 100 * 1024 * 1024, // 100MB default limit
        maxCompressionRatio: 100, // Maximum compression ratio
        maxFiles: 10000 // Maximum number of files in ZIP
    });

    if (nodejsUtils.isNode && nodejsUtils.isStream(data)) {
        return external.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file."));
    }

    return utils.prepareContent("the loaded zip file", data, true, options.optimizedBinaryString, options.base64)
        .then(function (data) {
            var zipEntries = new ZipEntries(options);
            zipEntries.load(data);
            return zipEntries;
        }).then(function checkCRC32(zipEntries) {
            var promises = [external.Promise.resolve(zipEntries)];
            var files = zipEntries.files;
            if (options.checkCRC32) {
                for (var i = 0; i < files.length; i++) {
                    promises.push(checkEntryCRC32(files[i]));
                }
            }
            return external.Promise.all(promises);
        }).then(function addFiles(results) {
            var zipEntries = results.shift();
            var files = zipEntries.files;
            
            // Security check: validate number of files
            if (files.length > options.maxFiles) {
                throw new Error("ZIP file contains too many files (" + files.length + " > " + options.maxFiles + ")");
            }
            
            var totalUncompressedSize = 0;
            
            for (var i = 0; i < files.length; i++) {
                var input = files[i];
                
                // Security check: validate file size and compression ratio
                if (input.decompressed && input.decompressed.uncompressedSize) {
                    totalUncompressedSize += input.decompressed.uncompressedSize;
                    
                    if (totalUncompressedSize > options.maxUncompressedSize) {
                        throw new Error("ZIP file uncompressed size exceeds limit (" + totalUncompressedSize + " > " + options.maxUncompressedSize + ")");
                    }
                    
                    // Check compression ratio (potential ZIP bomb)
                    if (input.compressedSize > 0) {
                        var compressionRatio = input.decompressed.uncompressedSize / input.compressedSize;
                        if (compressionRatio > options.maxCompressionRatio) {
                            throw new Error("File '" + input.fileNameStr + "' has suspicious compression ratio: " + compressionRatio);
                        }
                    }
                }

                var unsafeName = input.fileNameStr;
                var safeName = utils.resolve(input.fileNameStr);

                zip.file(safeName, input.decompressed, {
                    binary: true,
                    optimizedBinaryString: true,
                    date: input.date,
                    dir: input.dir,
                    comment: input.fileCommentStr.length ? input.fileCommentStr : null,
                    unixPermissions: input.unixPermissions,
                    dosPermissions: input.dosPermissions,
                    createFolders: options.createFolders
                });
                if (!input.dir) {
                    zip.file(safeName).unsafeOriginalName = unsafeName;
                }
            }
            if (zipEntries.zipComment.length) {
                zip.comment = zipEntries.zipComment;
            }

            return zip;
        });
};
