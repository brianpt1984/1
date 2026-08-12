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

QUnit.test("delay defers execution and passes arguments", function (assert) {
    var done = assert.async();
    var selfContext = { foo: "bar" };
    var called = false;

    utils.delay(function (a, b) {
        called = true;
        assert.strictEqual(this.foo, "bar", "Context is correctly set");
        assert.strictEqual(a, 1, "Argument 1 passed");
        assert.strictEqual(b, 2, "Argument 2 passed");
        done();
    }, [1, 2], selfContext);

    assert.ok(!called, "Execution is deferred");
});

QUnit.test("delay works without args and self", function (assert) {
    var done = assert.async();
    var called = false;

    utils.delay(function () {
        called = true;
        assert.strictEqual(arguments.length, 0, "No arguments passed");
        done();
    });

    assert.ok(!called, "Execution is deferred");
});
