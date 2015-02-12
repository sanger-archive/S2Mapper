//This file is part of S2 and is distributed under the terms of GNU General Public License version 1 or later;
//Please refer to the LICENSE and README files for information on licensing and authorship of this file.
//Copyright (C) 2013 Genome Research Ltd.
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
      var state     = {};
      var functions = _.chain(arguments);
      if ((typeof arguments[0] !== 'function') && !(arguments[0] instanceof Array)) {
        state     = arguments[0];
        functions = functions.drop(1);
      }

      functions = functions.flatten();
      return functions.drop(1).reduce(
        function(m,f) { return m.then(_.partial(f, state)); },
        functions.first().value()(state)
      ).value().then(function() {
        return state;
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
      var state  = {};
      var chains = _.chain(arguments);
      if (typeof arguments[0] !== 'function') {
        state  = arguments[0];
        chains = chains.drop(1);
      }

      var self = this;
      return $.when.apply(null, chains.map(function(f) {
        return self.sequentially(state, f).promise();
      }).value()).then(function() {
        return state;
      });
    }
  };
});
