"use strict";

// These tests only run in Node
var utils = require("../../lib/utils");

QUnit.module("utils");

QUnit.test("Paths are resolved correctly", function (assert) {
    // Backslashes can be part of filenames
    assert.strictEqual(utils.resolve("root\\a\\b"), "root\\a\\b");
    assert.strictEqual(utils.resolve("root/a/b"), "root/a/b");
    assert.strictEqual(utils.resolve("root/a/.."), "root");
    assert.strictEqual(utils.resolve("root/a/../b"), "root/b");
    assert.strictEqual(utils.resolve("root/a/./b"), "root/a/b");
    assert.strictEqual(utils.resolve("root/../../../"), "");
    assert.strictEqual(utils.resolve("////"), "/");
    assert.strictEqual(utils.resolve("/a/b/c"), "/a/b/c");
    assert.strictEqual(utils.resolve("a/b/c/"), "a/b/c/");
    assert.strictEqual(utils.resolve("../../../../../a"), "a");
    assert.strictEqual(utils.resolve("../app.js"), "app.js");
});

QUnit.test("checkSupport throws on unsupported type", function (assert) {
    assert.throws(
        function () {
            utils.checkSupport("unsupported_mock_type");
        },
        new Error("unsupported_mock_type is not supported by this platform"),
        "Throws an error when type is not supported"
    );
});

QUnit.test("checkSupport does not throw on supported type", function (assert) {
    // string and array are hardcoded to true in lib/support.js
    utils.checkSupport("string");
    utils.checkSupport("array");
    utils.checkSupport("base64");
    // Also test case insensitivity
    utils.checkSupport("STRING");
    assert.ok(true, "Does not throw an error for supported types");
});
