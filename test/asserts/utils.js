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

QUnit.test("inherits", function (assert) {
    function Parent() {
        this.parentProp = true;
    }
    Parent.prototype.parentMethod = function () {
        return "parent";
    };

    function Child() {
        Parent.call(this);
        this.childProp = true;
    }
    utils.inherits(Child, Parent);
    Child.prototype.childMethod = function () {
        return "child";
    };

    var instance = new Child();
    assert.ok(instance instanceof Child, "instance is a Child");
    assert.ok(instance instanceof Parent, "instance is a Parent");
    assert.strictEqual(instance.parentMethod(), "parent", "instance inherits parent prototype methods");
    assert.strictEqual(instance.childMethod(), "child", "instance has child prototype methods");
    assert.ok(instance.parentProp, "instance executes parent constructor");
    assert.ok(instance.childProp, "instance executes child constructor");
});
