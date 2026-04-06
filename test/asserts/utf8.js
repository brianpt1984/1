"use strict";

QUnit.module("utf8");

if (typeof require !== "undefined") {
    var utf8 = require("../../lib/utf8");

    QUnit.test("utf8.utf8encode handles empty string", function (assert) {
        var result = utf8.utf8encode("");
        assert.equal(result.length, 0, "empty string gives 0 byte");
    });

    QUnit.test("utf8.utf8encode handles ASCII", function (assert) {
        var result = utf8.utf8encode("abcd");
        assert.equal(result.length, 4, "ASCII string length is correct");
        assert.equal(result[0], 97, "a");
        assert.equal(result[1], 98, "b");
        assert.equal(result[2], 99, "c");
        assert.equal(result[3], 100, "d");
    });

    QUnit.test("utf8.utf8encode handles 2-byte characters", function (assert) {
        var result = utf8.utf8encode("£"); // U+00A3
        assert.equal(result.length, 2, "2-byte character length is correct");
        assert.equal(result[0], 0xc2, "first byte");
        assert.equal(result[1], 0xa3, "second byte");
    });

    QUnit.test("utf8.utf8encode handles 3-byte characters", function (assert) {
        var result = utf8.utf8encode("€"); // U+20AC
        assert.equal(result.length, 3, "3-byte character length is correct");
        assert.equal(result[0], 0xe2, "first byte");
        assert.equal(result[1], 0x82, "second byte");
        assert.equal(result[2], 0xac, "third byte");
    });

    QUnit.test("utf8.utf8encode handles surrogate pairs (4-byte characters)", function (assert) {
        var result = utf8.utf8encode("💩"); // U+1F4A9
        assert.equal(result.length, 4, "4-byte character length is correct");
        assert.equal(result[0], 0xf0, "first byte");
        assert.equal(result[1], 0x9f, "second byte");
        assert.equal(result[2], 0x92, "third byte");
        assert.equal(result[3], 0xa9, "fourth byte");
    });

    QUnit.test("utf8.utf8encode handles mixed strings", function (assert) {
        var result = utf8.utf8encode("a£€💩");
        assert.equal(result.length, 1 + 2 + 3 + 4, "mixed string length is correct");
        var expected = [
            0x61,
            0xc2, 0xa3,
            0xe2, 0x82, 0xac,
            0xf0, 0x9f, 0x92, 0xa9
        ];
        for (var i = 0; i < expected.length; i++) {
            assert.equal(result[i], expected[i], "byte " + i + " matches");
        }
    });
}

QUnit.test("JSZip correctly encodes filenames as UTF-8", function (assert) {
    var done = assert.async();
    var zip = new JSZip();
    var filename = "€💩.txt";
    zip.file(filename, "content");
    zip.generateAsync({type: "uint8array"}).then(function (content) {
        // We look for the filename in the ZIP content.
        // It should be encoded as UTF-8.
        // € -> E2 82 AC
        // 💩 -> F0 9F 92 A9
        var expectedBytes = [0xe2, 0x82, 0xac, 0xf0, 0x9f, 0x92, 0xa9];

        var found = false;
        for (var i = 0; i < content.length - expectedBytes.length; i++) {
            var match = true;
            for (var j = 0; j < expectedBytes.length; j++) {
                if (content[i + j] !== expectedBytes[j]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                found = true;
                break;
            }
        }
        assert.ok(found, "The UTF-8 encoded filename was found in the generated ZIP");
        done();
    })["catch"](JSZipTestUtils.assertNoError);
});
