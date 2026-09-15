"use strict";
var StreamHelper = require("../../lib/stream/StreamHelper");
var GenericWorker = require("../../lib/stream/GenericWorker");
var QUnit = require("qunit");

QUnit.module("StreamHelper");

QUnit.test("accumulate catches errors from transformZipOutput", function(assert) {
    var done = assert.async();

    // Create a mock worker that pushes some data
    var worker = new GenericWorker("string");

    // Use an unsupported output type to trigger an error in transformZipOutput
    var helper = new StreamHelper(worker, "unsupported_type", "");

    helper.accumulate().then(function() {
        assert.ok(false, "Should have rejected");
        done();
    })["catch"](function(err) {
        assert.ok(err.message.indexOf("unsupported_type") !== -1 || err.message.indexOf("not supported") !== -1, "Got expected error");
        done();
    });

    // Push some data and end the stream
    worker.push({data: "test", meta: {percent: 0}});
    worker.push({data: "data", meta: {percent: 100}});
    worker.end();
});
