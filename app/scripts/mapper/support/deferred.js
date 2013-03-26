/*
 * Provides functions for working with functions that return deferreds that are either sequentially 
 * dependent, or dependent in parallel.  The objects returned from the two functions behave like
 * deferreds themselves, although limited in their functionality slightly.
 */
define([], function() {
  return {
    /*
     * Create a deferred-like object that handles a number of functions that are sequentially dependent,
     * i.e. function 2 will only execute if the deferred from function 1 succeeds in being resolved.
     * The functions are specified as individual arguments to this function, or as an array, and the
     * initial argument can be the initial state of the deferred.  In other words, the function signature
     * is one of the following:
     *
     * - sequentially(function, ...)
     * - sequentially(state, function, ...)
     * - sequentially([function, ...])
     * - sequentially(state, [function, ...])
     */
    sequentially: function() {
      var initial_state = {};
      var functions     = _.chain(arguments);
      if ((typeof arguments[0] !== 'function') && !(arguments[0] instanceof Array)) {
        initial_state = arguments[0];
        functions     = functions.drop(1);
      }

      functions = functions.flatten();
      return functions.drop(1).reduce(
        function(m,f) { return m.then(enact(f, initial_state)); },
        functions.first().value()(initial_state)
      ).value().then(function() {
        return initial_state;
      });
    },

    /*
     * Create a deferred-like object that handles a number of streams of functions that resolve in deferreds
     * in parallel.  Essentially this is wrapping $.when() and using the sequentially function above to handle
     * the streams.  Streams have 1 or more functions in them.  The initial argument is the state that will
     * be shared by the parallel streams and returned on successful completion; if this is not present then
     * the shared state is an empty object.  Then each argument is either a function, or an array of functions.
     * Hence the function signature is one of the following:
     *
     * - in_parallel(function, ...)
     * - in_parallel([function,...], [function,...])
     * - in_parallel(state, function, ...)
     * - in_parallel(state, [function,...], [function,...])
     */
    in_parallel: function() {
      var initial_state = {};
      var chains        = _.chain(arguments);
      if (typeof arguments[0] !== 'function') {
        initial_state = arguments[0];
        chains        = chains.drop(1);
      }

      var self = this;
      return $.when.apply(null, chains.map(function(f) {
        return self.sequentially(initial_state, f).promise();
      }).value()).then(function() {
        return initial_state;
      });
    }
  };

  function enact(fn, state) {
    return _.partial(fn, state);
  }
  function build(state) {
    var outside  = $.Deferred();
    var deferred = undefined;

    return {
      then: function(callback) {
        // On the first call to then() we start the deferred sequence.  On subsequent calls,
        // though, we need to hook in the deferred, so we replace the implementation of then()
        // on the first call.
        this.then = function(callback) {
          deferred.done(function() {
            deferred = enact(callback, state, arguments).fail(outside.reject);
          });
          return this;
        };
        deferred = enact(callback, state).fail(outside.reject);
        return this;
      },
      resolve: function(callback) {
        // Ensure that the callback is hooked into the current promise, and then unhook
        // us so that further calls do nothing.
        deferred.done(function() { outside.resolve(enact(callback, state, arguments)); });
        this.resolve = function(callback) { };
        return this;
      },
      fail: function(callback) {
        deferred.fail(function() {
          outside.reject(enact(callback, state, arguments));
        });
        return this;
      },
      promise: function() {
        // Ensure that the deferred will be properly resolved, if it's not already been.
        this.resolve(function(state) { return state; });
        return outside.promise();
      }
    };
  }
});
