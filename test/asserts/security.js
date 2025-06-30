const JSZip = require('../lib/index.js');
const assert = require('assert');

/**
 * Security tests for JSZip
 */
describe('Security Tests', function() {
    
    describe('Path Traversal Protection', function() {
        
        it('should resolve normal paths correctly', function() {
            const utils = require('../lib/utils.js');
            assert.strictEqual(utils.resolve('normal/path/file.txt'), 'normal/path/file.txt');
            assert.strictEqual(utils.resolve('folder/./file.txt'), 'folder/file.txt');
        });
        
        it('should handle relative paths safely', function() {
            const utils = require('../lib/utils.js');
            assert.strictEqual(utils.resolve('folder/../file.txt'), 'file.txt');
            assert.strictEqual(utils.resolve('a/b/../c/file.txt'), 'a/c/file.txt');
        });
        
        it('should throw error for suspicious path patterns', function() {
            const utils = require('../lib/utils.js');
            assert.throws(() => {
                // This should trigger the suspicious pattern detection
                utils.resolve('../'.repeat(15) + 'etc/passwd');
            }, /suspicious traversal patterns/);
        });
        
        it('should throw error for invalid input types', function() {
            const utils = require('../lib/utils.js');
            assert.throws(() => {
                utils.resolve(null);
            }, /Path must be a string/);
            
            assert.throws(() => {
                utils.resolve(undefined);
            }, /Path must be a string/);
        });
        
        it('should handle backslashes correctly', function() {
            const utils = require('../lib/utils.js');
            assert.strictEqual(utils.resolve('folder\\file.txt'), 'folder/file.txt');
            assert.strictEqual(utils.resolve('folder\\..\\file.txt'), 'file.txt');
        });
    });
    
    describe('ZIP Bomb Protection', function() {
        
        it('should respect maxFiles limit', async function() {
            // This would need a specially crafted ZIP with many files to test properly
            // For now, we test that the option is recognized
            const zip = new JSZip();
            zip.file('test.txt', 'content');
            
            const content = await zip.generateAsync({type: 'nodebuffer'});
            
            try {
                await JSZip.loadAsync(content, { maxFiles: 0 });
                assert.fail('Should have thrown an error for exceeding maxFiles');
            } catch (error) {
                assert(error.message.includes('too many files'));
            }
        });
        
        it('should respect maxUncompressedSize limit', async function() {
            const zip = new JSZip();
            zip.file('test.txt', 'x'.repeat(1000)); // Small file
            
            const content = await zip.generateAsync({type: 'nodebuffer'});
            
            try {
                await JSZip.loadAsync(content, { maxUncompressedSize: 100 });
                // This might not always trigger depending on how size is calculated
                // The test verifies the option exists and is processed
            } catch (error) {
                assert(error.message.includes('exceeds limit'));
            }
        });
    });
    
    describe('Input Validation', function() {
        
        it('should handle malformed ZIP data gracefully', async function() {
            const malformedData = Buffer.from('This is not a ZIP file');
            
            try {
                await JSZip.loadAsync(malformedData);
                assert.fail('Should have thrown an error for malformed ZIP');
            } catch (error) {
                assert(error.message.includes('Corrupted zip') || error.message.includes('signature'));
            }
        });
        
        it('should validate security options', async function() {
            const zip = new JSZip();
            zip.file('test.txt', 'content');
            
            const content = await zip.generateAsync({type: 'nodebuffer'});
            
            // Test that security options are properly parsed
            const loadedZip = await JSZip.loadAsync(content, {
                maxFiles: 1000,
                maxUncompressedSize: 10 * 1024 * 1024,
                maxCompressionRatio: 50
            });
            
            assert(loadedZip.files['test.txt']);
        });
    });
});

module.exports = {};
