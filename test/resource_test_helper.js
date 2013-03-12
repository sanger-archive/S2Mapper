/*
 * Provides a utility function for setting up tests that use the S2 API.  Use to wrap the actual Jasmine specs
 * as in the following example:
 *
 *   define(['resource_test_helper'], function(TestHelper) {
 *     TestHelper(function(results) {
 *       describe('my resource', function() {
 *         results.lifeCycle();  // Ensure setup & teardown behave properly
 *       });
 *     })
 *   });
 */
define([], function() {
  return function(callback) {
    var results = {};
    callback({
      // Returns a function that will set the given result into the specified name
      assignTo: function(target) {
        return function(r) { results[target] = r; };
      },

      // Retrieves the result with the specified name
      get: function(name) {
        return results[name];
      },

      // Ensures that before and after each test the results are properly reset
      lifeCycle: function() {
        beforeEach(function() { results = {}; console.log("BEFORE: Reset results"); });
        afterEach(function()  { results = {}; console.log("AFTER: Reset results");  });
      },

      // Resets the results
      reset: function() {
        results = {};
      }
    });
  };
});
