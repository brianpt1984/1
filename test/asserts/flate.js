"use strict";

var flate = require("../../lib/flate");
var GenericWorker = require("../../lib/stream/GenericWorker");

QUnit.module("flate");

QUnit.test("compressWorker returns a FlateWorker", function (assert) {
    var worker = flate.compressWorker({ level: 9 });
    assert.ok(worker instanceof GenericWorker, "worker is a GenericWorker");
    assert.strictEqual(worker.name, "FlateWorker/Deflate", "worker has the correct name");
    assert.strictEqual(worker._pakoAction, "Deflate", "worker uses Deflate");
    assert.strictEqual(worker._pakoOptions.level, 9, "worker options are passed");
});

QUnit.test("uncompressWorker returns a FlateWorker", function (assert) {
    var worker = flate.uncompressWorker();
    assert.ok(worker instanceof GenericWorker, "worker is a GenericWorker");
    assert.strictEqual(worker.name, "FlateWorker/Inflate", "worker has the correct name");
    assert.strictEqual(worker._pakoAction, "Inflate", "worker uses Inflate");
    assert.deepEqual(worker._pakoOptions, {}, "worker options are empty");
});
