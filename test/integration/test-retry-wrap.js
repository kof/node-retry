var common = require('../common');
var assert = common.assert;
var fake = common.fake.create();
var retry = require(common.dir.lib + '/retry');

function getLib() {
  return {
    fn1: function() {},
    fn2: function() {},
    fn3: function() {}
  };
}

(function wrapAll() {
  var lib = getLib();
  retry.wrap(lib);
  assert.equal(lib.fn1.name, 'retryWrapper');
  assert.equal(lib.fn2.name, 'retryWrapper');
  assert.equal(lib.fn3.name, 'retryWrapper');
}());

(function wrapAllPassOptions() {
  var lib = getLib();
  retry.wrap(lib, {retries: 2});
  assert.equal(lib.fn1.name, 'retryWrapper');
  assert.equal(lib.fn2.name, 'retryWrapper');
  assert.equal(lib.fn3.name, 'retryWrapper');
  assert.equal(lib.fn1.options.retries, 2);
  assert.equal(lib.fn2.options.retries, 2);
  assert.equal(lib.fn3.options.retries, 2);
}());

(function wrapDefined() {
  var lib = getLib();
  retry.wrap(lib, ['fn2', 'fn3']);
  assert.notEqual(lib.fn1.name, 'retryWrapper');
  assert.equal(lib.fn2.name, 'retryWrapper');
  assert.equal(lib.fn3.name, 'retryWrapper');
}());

(function wrapDefinedAndPassOptions() {
  var lib = getLib();
  retry.wrap(lib, {retries: 2}, ['fn2', 'fn3']);
  assert.notEqual(lib.fn1.name, 'retryWrapper');
  assert.equal(lib.fn2.name, 'retryWrapper');
  assert.equal(lib.fn3.name, 'retryWrapper');
  assert.equal(lib.fn2.options.retries, 2);
  assert.equal(lib.fn3.options.retries, 2);
}());

(function runWrappedWithoutError() {
  var callbackCalled;
  var lib = {method: function(a, b, callback) {
    assert.equal(a, 1);
    assert.equal(b, 2);
    assert.equal(typeof callback, 'function');
    callback();
  }};
  retry.wrap(lib);
  lib.method(1, 2, function() {
    callbackCalled = true;
  });
  assert.ok(callbackCalled);
}());

(function runWrappedWithError() {
  var callbackCalled;
  var lib = {method: function(callback) {
    callback(new Error('Some error'));
  }};
  retry.wrap(lib, {retries: 1});
  lib.method(function(err) {
    callbackCalled = true;
    assert.ok(err instanceof Error);
  });
  assert.ok(!callbackCalled);
}());

