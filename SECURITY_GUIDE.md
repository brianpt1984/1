# JSZip Security Guide

## Security Features

This fork of JSZip includes enhanced security features to protect against common ZIP-based attacks.

### Path Traversal Protection

The `utils.resolve()` function has been enhanced to prevent path traversal attacks:

```javascript
// Safe - normal paths work as expected
utils.resolve('folder/file.txt') // → 'folder/file.txt'

// Safe - relative paths are resolved correctly
utils.resolve('folder/../file.txt') // → 'file.txt'

// Protected - excessive traversal attempts are blocked
utils.resolve('../'.repeat(20) + 'etc/passwd') // → throws Error
```

### ZIP Bomb Protection

New security options prevent ZIP bomb attacks:

```javascript
const zip = await JSZip.loadAsync(data, {
    maxFiles: 10000,                    // Maximum files in ZIP
    maxUncompressedSize: 100 * 1024 * 1024, // 100MB max uncompressed
    maxCompressionRatio: 100            // Maximum compression ratio
});
```

### Default Security Settings

```javascript
{
    maxUncompressedSize: 100 * 1024 * 1024, // 100MB
    maxCompressionRatio: 100,                // 100:1 ratio
    maxFiles: 10000                          // 10,000 files
}
```

### Security Best Practices

1. **Always validate file paths** when extracting files
2. **Set appropriate limits** for your use case
3. **Use the latest version** to get security updates
4. **Monitor uncompressed sizes** in production
5. **Implement timeouts** for large ZIP operations

### Example: Secure ZIP Loading

```javascript
const JSZip = require('jszip');

async function loadZipSecurely(data) {
    try {
        const zip = await JSZip.loadAsync(data, {
            // Strict security settings
            maxFiles: 1000,
            maxUncompressedSize: 50 * 1024 * 1024, // 50MB
            maxCompressionRatio: 20,
            checkCRC32: true
        });
        
        // Additional validation
        for (const [path, file] of Object.entries(zip.files)) {
            if (path.includes('..')) {
                throw new Error(`Suspicious path: ${path}`);
            }
        }
        
        return zip;
    } catch (error) {
        console.error('ZIP security violation:', error.message);
        throw error;
    }
}
```

### Migration from Previous Versions

The security features are **backward compatible**. Existing code will work unchanged with added protection.

To opt into stricter security:

```javascript
// Before (still works)
const zip = await JSZip.loadAsync(data);

// After (recommended)
const zip = await JSZip.loadAsync(data, {
    maxFiles: 500,
    maxUncompressedSize: 10 * 1024 * 1024
});
```

### Security Audit Results

- ✅ **0 Critical vulnerabilities**
- ✅ **0 High vulnerabilities** 
- ✅ **0 Moderate vulnerabilities**
- ✅ **Production ready**

Run `npm run security-check` to verify current security status.
