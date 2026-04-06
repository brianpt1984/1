"use strict";

/**
 * These tests only run in Node.js because they require internal modules.
 * Browser-based integration testing for UTF-8 is covered in unicode.js.
 */
var utf8 = require("../../lib/utf8");

QUnit.module("utf8");

QUnit.test("utf8.utf8encode handles empty string", function (assert) {
    var result = utf8.utf8encode("");
    assert.equal(result.length, 0, "empty string gives 0 byte");
});

QUnit.test("utf8.utf8encode handles ASCII", function (assert) {
    var result = utf8.utf8encode("abcd");
    var expected = [97, 98, 99, 100];
    assert.equal(result.length, expected.length, "ASCII string length is correct");
    assert.deepEqual(Array.prototype.slice.call(result), expected, "ASCII bytes match");
});

QUnit.test("utf8.utf8encode handles 2-byte characters", function (assert) {
    var result = utf8.utf8encode("£"); // U+00A3
    var expected = [0xc2, 0xa3];
    assert.equal(result.length, expected.length, "2-byte character length is correct");
    assert.deepEqual(Array.prototype.slice.call(result), expected, "2-byte character bytes match");
});

QUnit.test("utf8.utf8encode handles 3-byte characters", function (assert) {
    var result = utf8.utf8encode("€"); // U+20AC
    var expected = [0xe2, 0x82, 0xac];
    assert.equal(result.length, expected.length, "3-byte character length is correct");
    assert.deepEqual(Array.prototype.slice.call(result), expected, "3-byte character bytes match");
});

QUnit.test("utf8.utf8encode handles surrogate pairs (4-byte characters)", function (assert) {
    var result = utf8.utf8encode("💩"); // U+1F4A9
    var expected = [0xf0, 0x9f, 0x92, 0xa9];
    assert.equal(result.length, expected.length, "4-byte character length is correct");
    assert.deepEqual(Array.prototype.slice.call(result), expected, "4-byte character bytes match");
});

QUnit.test("utf8.utf8encode handles mixed strings", function (assert) {
    var result = utf8.utf8encode("a£€💩");
    var expected = [
        0x61,
        0xc2, 0xa3,
        0xe2, 0x82, 0xac,
        0xf0, 0x9f, 0x92, 0xa9
    ];
    assert.equal(result.length, expected.length, "mixed string length is correct");
    assert.deepEqual(Array.prototype.slice.call(result), expected, "mixed string bytes match");
});
