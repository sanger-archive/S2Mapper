define([
  'resource_test_helper',
  'mapper/support/deferred'
], function(TestHelper, Deferred) {
  'use strict';

  TestHelper(function(results) {
    describe("Deferred", function() {
      results.lifeCycle();

      describe("sequentially", function() {
        function succeed(state) { state.success = state.success + 1; return $.Deferred().resolve('Woot!').promise(); }
        function fail(state)    { state.failure = true;              return $.Deferred().reject('Boo!').promise();   }
        function state(state)   { return state; }

        describe("single step", function() {
          it("handles a single function", function() {
            Deferred.sequentially(succeed).promise().done(results.expected).fail(results.unexpected);
            results.expectToBeCalled();
          });

          it("handles a failure", function() {
            Deferred.sequentially(fail).promise().done(results.unexpected).fail(results.expected);
            results.expectToBeCalled();
          });

          it("handles initial state with single function", function() {
            Deferred.sequentially({success:0}, succeed).promise().done(results.assignTo('result')).fail(results.unexpected);
            expect(results.get('result')).to.deep.equal({ success: 1 });
          });
        });

        describe("two steps", function() {
          it("handles two functions", function() {
            Deferred.sequentially(succeed, succeed).promise().done(results.expected).fail(results.unexpected);
            results.expectToBeCalled();
          });

          it("handles two functions in an array", function() {
            Deferred.sequentially([succeed, succeed]).promise().done(results.expected).fail(results.unexpected);
            results.expectToBeCalled();
          });

          it("handles initial state with two functions", function() {
            Deferred.sequentially({success:0}, succeed, succeed).promise().done(results.assignTo('result')).fail(results.unexpected);
            expect(results.get('result')).to.deep.equal({ success: 2 });
          });

          it("handles initial state with two functions in an array", function() {
            Deferred.sequentially({success:0}, [succeed, succeed]).promise().done(results.assignTo('result')).fail(results.unexpected);
            expect(results.get('result')).to.deep.equal({ success: 2 });
          });

          it("handles failure at step 1", function() {
            Deferred.sequentially(fail, succeed).promise().done(results.unexpected).fail(results.expected);
            results.expectToBeCalled();
          });

          it("handles failure at step 2", function() {
            Deferred.sequentially(succeed, fail).promise().done(results.unexpected).fail(results.expected);
            results.expectToBeCalled();
          });

          it("passes arguments flatly", function() {
            Deferred.sequentially(
              function(state) {
                return $.Deferred().resolve('first').promise();
              }, function(state, arg1) {
                state.arg1 = arg1;
                return $.Deferred().resolve('second', 'third').promise();
              }, function(state, arg2, arg3) {
                state.arg2 = arg2;
                state.arg3 = arg3;
                return state;
              }
            ).promise().done(results.assignTo('result'));

            expect(results.get('result')).to.deep.equal({ arg1: 'first', arg2: 'second', arg3: 'third' });
          });
        });
      });

      describe("in_parallel", function() {
        function left(state)  { state.left    = state.left + 1;  return $.Deferred().resolve('Woot!').promise(); }
        function right(state) { state.right   = state.right + 1; return $.Deferred().resolve('Woot!').promise(); }
        function fail(state)  { state.failure = true;            return $.Deferred().reject('Boo!').promise();   }

        it("handles two functions that succeed", function() {
          Deferred.in_parallel(
            left,
            right
          ).promise().done(results.expected).fail(results.unexpected);
          results.expectToBeCalled();
        });

        it("handles state", function() {
          Deferred.in_parallel(
            {left:0,right:0},
            left,
            right
          ).promise().done(results.assignTo('result')).fail(results.unexpected);
          expect(results.get('result')).to.deep.equal({ left: 1, right: 1 })
        });

        it("handles chains of functions", function() {
          Deferred.in_parallel(
            {left:0,right:0},
            [left,left],
            [right,right]
          ).promise().done(results.assignTo('result')).fail(results.unexpected);
          expect(results.get('result')).to.deep.equal({ left: 2, right: 2 })
        });

        it("handles two functions where left fails", function() {
          Deferred.in_parallel(fail, right).promise().done(results.unexpected).fail(results.expected);
          results.expectToBeCalled();
        });

        it("handles two functions where right fails", function() {
          Deferred.in_parallel(left, fail).promise().done(results.unexpected).fail(results.expected);
          results.expectToBeCalled();
        });
      });
    });
  });
});
