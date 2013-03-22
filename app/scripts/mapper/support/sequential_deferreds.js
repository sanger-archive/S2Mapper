/*
 * Behaves like a promise, but is for dealing with sequential promises, where you would
 * normally nest the code.  Instead we work with a state and the current promise.
 */
define([], function() {
  return function SequentialDeferred(initialState) {
    var outside  = $.Deferred();
    var deferred = undefined;
    var state    = $.extend({}, initialState || {});

    return {
      then: function(callback) {
        // On the first call to then() we start the deferred sequence.  On subsequent calls,
        // though, we need to hook in the deferred, so we replace the implementation of then()
        // on the first call.
        this.then = function(callback) {
          deferred.done(function() {
            deferred = callback(state, arguments).fail(outside.reject);
          });
          return this;
        };
        deferred = callback(state).fail(outside.reject);
        return this;
      },
      resolve: function(callback) {
        // Ensure that the callback is hooked into the current promise, and then unhook
        // us so that further calls do nothing.
        deferred.done(function() { outside.resolve(callback(state, arguments)); });
        this.resolve = function(callback) { };
        return this;
      },
      fail: function(callback) {
        deferred.fail(function() {
          outside.reject(callback(state, arguments));
        });
        return this;
      },
      promise: function() {
        // Ensure that the deferred will be properly resolved, if it's not already been.
        this.resolve(function(state) { return state; });
        return outside.promise();
      }
    };
  };
});
