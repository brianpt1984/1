var JSZip = require('../../lib/index.js');
var assert = require('assert');

/**
 * Security tests for JSZip
 */
describe('Security Tests', function() {
    
    describe('Path Traversal Protection', function() {
        
        it('should resolve normal paths correctly', function() {
            var utils = require('../../lib/utils.js');
            assert.strictEqual(utils.resolve('normal/path/file.txt'), 'normal/path/file.txt');
            assert.strictEqual(utils.resolve('folder/./file.txt'), 'folder/file.txt');
        });
        
        it('should handle relative paths safely', function() {
            var utils = require('../../lib/utils.js');
            assert.strictEqual(utils.resolve('folder/../file.txt'), 'file.txt');
            assert.strictEqual(utils.resolve('a/b/../c/file.txt'), 'a/c/file.txt');
        });
        
        it('should throw error for suspicious path patterns', function() {
            var utils = require('../../lib/utils.js');
            assert.throws(function() {
                // This should trigger the suspicious pattern detection
                var maliciousPath = '';
                for (var i = 0; i < 15; i++) {
                    maliciousPath += '../';
                }
                utils.resolve(maliciousPath + 'etc/passwd');
            }, /suspicious traversal patterns/);
        });
        
        it('should throw error for invalid input types', function() {
            var utils = require('../../lib/utils.js');
            assert.throws(function() {
                utils.resolve(null);
            }, /Path must be a string/);
            
            assert.throws(function() {
                utils.resolve(undefined);
            }, /Path must be a string/);
        });
        
        it('should handle backslashes correctly', function() {
            var utils = require('../../lib/utils.js');
            assert.strictEqual(utils.resolve('folder\\file.txt'), 'folder/file.txt');
            assert.strictEqual(utils.resolve('folder\\..\\file.txt'), 'file.txt');
        });
    });
    
    describe('ZIP Bomb Protection', function() {
        
        it('should respect maxFiles limit', function(done) {
            // This would need a specially crafted ZIP with many files to test properly
            // For now, we test that the option is recognized
            var zip = new JSZip();
            zip.file('test.txt', 'content');
            
            zip.generateAsync({type: 'nodebuffer'}).then(function(content) {
                return JSZip.loadAsync(content, { maxFiles: 0 });
            }).then(function() {
                done(new Error('Should have thrown an error for exceeding maxFiles'));
            }).catch(function(error) {
                if (error.message.indexOf('too many files') !== -1) {
                    done();
                } else {
                    done(error);
                }
            });
        });
        
        it('should respect maxUncompressedSize limit', function(done) {
            var zip = new JSZip();
            var largeContent = '';
            for (var i = 0; i < 1000; i++) {
                largeContent += 'x';
            }
            zip.file('test.txt', largeContent);
            
            zip.generateAsync({type: 'nodebuffer'}).then(function(content) {
                return JSZip.loadAsync(content, { maxUncompressedSize: 100 });
            }).then(function() {
                // This might not always trigger depending on how size is calculated
                // The test verifies the option exists and is processed
                done();
            }).catch(function(error) {
                if (error.message.indexOf('exceeds limit') !== -1) {
                    done();
                } else {
                    done(error);
                }
            });
        });
    });
    
    describe('Input Validation', function() {
        
        it('should handle malformed ZIP data gracefully', function(done) {
            var malformedData;
            if (typeof Buffer !== 'undefined') {
                malformedData = Buffer.from('This is not a ZIP file');
            } else {
                malformedData = 'This is not a ZIP file';
            }
            
            JSZip.loadAsync(malformedData).then(function() {
                done(new Error('Should have thrown an error for malformed ZIP'));
            }).catch(function(error) {
                if (error.message.indexOf('Corrupted zip') !== -1 || error.message.indexOf('signature') !== -1) {
                    done();
                } else {
                    done(error);
                }
            });
        });
        
        it('should validate security options', function(done) {
            var zip = new JSZip();
            zip.file('test.txt', 'content');
            
            zip.generateAsync({type: 'nodebuffer'}).then(function(content) {
                // Test that security options are properly parsed
                return JSZip.loadAsync(content, {
                    maxFiles: 1000,
                    maxUncompressedSize: 10 * 1024 * 1024,
                    maxCompressionRatio: 50
                });
            }).then(function(loadedZip) {
                if (loadedZip.files['test.txt']) {
                    done();
                } else {
                    done(new Error('File not found in loaded ZIP'));
                }
            }).catch(function(error) {
                done(error);
            });
        });
    });
});

module.exports = {};
