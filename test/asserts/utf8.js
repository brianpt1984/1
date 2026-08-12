"use strict";

var utf8 = require("../../lib/utf8");
var support = require("../../lib/support");

QUnit.module("utf8");

QUnit.test("utf8encode works with ASCII string", function (assert) {
    var str = "Hello World!";
    var encoded = utf8.utf8encode(str);
    var expected = [72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33];

    assert.equal(encoded.length, expected.length, "Correct length");
    for (var i = 0; i < expected.length; i++) {
        assert.equal(encoded[i], expected[i], "Correct byte at " + i);
    }
});

QUnit.test("utf8encode works with non-ASCII string", function (assert) {
    var str = "Hello € World 🌍!";
    var encoded = utf8.utf8encode(str);
    var expected = [72, 101, 108, 108, 111, 32, 226, 130, 172, 32, 87, 111, 114, 108, 100, 32, 240, 159, 140, 141, 33];

    assert.equal(encoded.length, expected.length, "Correct length");
    for (var i = 0; i < expected.length; i++) {
        assert.equal(encoded[i], expected[i], "Correct byte at " + i);
    }
});

QUnit.test("utf8encode works when support.nodebuffer is true", function (assert) {
    var originalNodebuffer = support.nodebuffer;
    support.nodebuffer = true;

    var str = "NodeBuffer Test";
    var encoded = utf8.utf8encode(str);

    assert.ok(Buffer.isBuffer(encoded), "Result should be a Buffer");
    assert.equal(encoded.toString("utf-8"), str, "Buffer content should match");

    support.nodebuffer = originalNodebuffer;
});

QUnit.test("utf8encode works when support.nodebuffer is false", function (assert) {
    var originalNodebuffer = support.nodebuffer;
    support.nodebuffer = false;

    var str = "Fallback Test €";
    var encoded = utf8.utf8encode(str);
    var expected = [70, 97, 108, 108, 98, 97, 99, 107, 32, 84, 101, 115, 116, 32, 226, 130, 172];

    assert.notOk(Buffer.isBuffer(encoded) && !support.uint8array, "Result should not be a Buffer");
    assert.equal(encoded.length, expected.length, "Correct length");
    for (var i = 0; i < expected.length; i++) {
        assert.equal(encoded[i], expected[i], "Correct byte at " + i);
    }

    support.nodebuffer = originalNodebuffer;
});
