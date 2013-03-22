define([
  'resource_test_helper',
  'mapper/support/sequential_deferreds'
], function(TestHelper, SequentialDeferred) {
  'use strict';

  function succeed(state) { state.success = state.success + 1; return $.Deferred().resolve('Woot!').promise(); }
  function fail(state)    { state.failure = true;              return $.Deferred().reject('Boo!').promise();   }
  function state(state)   { return state; }

  TestHelper(function(results) {
    describe("SequentialDeferred", function() {
      results.lifeCycle();

      describe("single step", function() {
        it("no need to resolve on promise", function() {
          SequentialDeferred().then(succeed).promise().done(results.expected).fail(results.unexpected);
          results.expectToBeCalled();
        });

        it("handles success", function() {
          SequentialDeferred({success:0}).then(succeed).resolve(state).promise().done(results.assignTo('result')).fail(results.unexpected);
          expect(results.get('result')).toEqual({ success: 1 });
        });

        it("handles failure", function() {
          SequentialDeferred().then(fail).resolve(state).promise().done(results.unexpected).fail(results.expected);
          results.expectToBeCalled();
        });
      });

      describe("two steps", function() {
        it("handles success", function() {
          SequentialDeferred({success:0}).then(succeed).then(succeed).resolve(state).promise().done(results.assignTo('result')).fail(results.unexpected);
          expect(results.get('result')).toEqual({ success: 2 });
        });

        it("handles failure at step 1", function() {
          SequentialDeferred().then(fail).then(succeed).resolve(state).promise().done(results.unexpected).fail(results.expected);
          results.expectToBeCalled();
        });

        it("handles failure at step 2", function() {
          SequentialDeferred().then(succeed).then(fail).resolve(state).promise().done(results.unexpected).fail(results.expected);
          results.expectToBeCalled();
        });
      });
    });
  });
});
