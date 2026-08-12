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

QUnit.test("getTypeOf handles edge cases correctly", function (assert) {
    assert.strictEqual(utils.getTypeOf("test"), "string");
    assert.strictEqual(utils.getTypeOf([]), "array");

    // Edge cases
    assert.strictEqual(utils.getTypeOf({}), undefined);
    assert.strictEqual(utils.getTypeOf(null), undefined);
    assert.strictEqual(utils.getTypeOf(undefined), undefined);
    assert.strictEqual(utils.getTypeOf(123), undefined);
    assert.strictEqual(utils.getTypeOf(function(){}), undefined);
    assert.strictEqual(utils.getTypeOf(true), undefined);
});
