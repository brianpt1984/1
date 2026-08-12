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

QUnit.test("delay calls callback with context and arguments", function (assert) {
    var done = assert.async();
    var context = { test: "test" };
    var args = ["arg1", "arg2"];

    utils.delay(function(arg1, arg2) {
        assert.strictEqual(this, context, "context is correctly set");
        assert.strictEqual(arg1, args[0], "arg1 is correctly set");
        assert.strictEqual(arg2, args[1], "arg2 is correctly set");
        done();
    }, args, context);
});

QUnit.test("delay without args or context", function (assert) {
    var done = assert.async();

    utils.delay(function(arg1) {
        assert.strictEqual(arg1, undefined, "arg1 is undefined");
        done();
    });
});
