define([
  'resource_test_helper',
  'config',
  'mapper/operations',
  'mapper/s2_root',
  'text!json/unit/root.json',
  'text!json/unit/operations.json'
], function (TestHelper, config, Operations, Root, testDataRoot, testDataOrders) {
  'use strict';

  TestHelper(function (results) {
    describe("Operations", function () {
      results.lifeCycle();

      describe("operation", function () {
        function trackState(name) {
          return function (state) {
            state[name] = true;
            return $.Deferred().resolve(name);
          };
        }

        it("sequentialises to prepare -> start -> operate -> complete", function () {
          Operations.operation({
            prepare:trackState('prepare'),
            start:trackState('start'),
            operate:trackState('operate'),
            complete:trackState('complete')
          }).done(results.assignTo('result'));

          expect(results.get('result')).toEqual({
            prepare:true,
            start:true,
            operate:true,
            complete:true
          });
        });
      });

      describe("registerLabware", function () {
        var root;

        beforeEach(function () {
          config.loadTestData(testDataRoot);
          Root.load({user:"username"}).done(results.assignTo('root')).fail(results.unexpected);
          root = results.get('root');

          config.cummulativeLoadingTestDataInFirstStage(testDataOrders);
        });

        describe("performs create labware -> create barcode -> label labware", function () {
          var state;

          beforeEach(function () {
            Operations.registerLabware(
                root.tubes,
                'DNA',
                'stock'
            ).done(results.assignTo('state')).fail(results.unexpected);

            state = results.get('state');
          });

          it("outputs the labware", function () {
            expect(state.labware).toBeDefined();
          });

          it("outputs the barcode", function () {
            expect(state.barcode).toBeDefined();
          });
        });

        it("passes the attributes to the labware constructor", function () {
          Operations.registerLabware(
              root.tubes,
              'DNA',
              'stock',
              { 'foo':'bar' }
          ).done(results.expected).fail(results.unexpected);
        });
      });

      describe("betweenLabware", function () {
        var root;

        beforeEach(function () {
          config.loadTestData(testDataRoot);
          Root.load({user:"username"}).done(results.assignTo('root')).fail(results.unexpected);
          root = results.get('root');

          config.cummulativeLoadingTestDataInFirstStage(testDataOrders);

          root.find('order-with-single-item').done(results.assignTo('order')).fail(results.unexpected);
          root.find('input-tube-1').done(results.assignTo('inputTube')).fail(results.unexpected);
          root.find('output-tube-1').done(results.assignTo('outputTube')).fail(results.unexpected);
        });

        it("handles simple tube-to-tube transfer", function () {
          Operations.betweenLabware(root.actions.transfer_tubes_to_tubes, [
            function (operations, state) {
              operations.push({
                input:{ resource:results.get('inputTube'), role:'inputRole', order:results.get('order') },
                output:{ resource:results.get('outputTube'), role:'outputRole' },
                fraction:0.5,
                aliquot_type:'DNA'
              });
              return $.Deferred().resolve('Woot!').promise();
            }
          ]).operation().done(results.expected).fail(results.unexpected);
        });

//        betweenLabware(
//          batch.root.actions.transfer_tubes_to_tubes,
//          batch.items.filter(function(i) {
//            return i.role === 'input_tube';
//          }).map(function(inputItem) {
//            return function(operations, state) {
//              return Operations.registerLabware(
//                batch.root.tubes,
//                'DNA',
//                'stock'
//              ).then(function(s) {
//                operations.push({
//                  input:        { resource: inputItem.resource, role: inputItem.role, order: inputItem.order },
//                  output:       { resource: s.labware,          role: 'output_tube' },
//                  fraction:     0.5,
//                  aliquot_type: 'DNA'
//                });
//              });
//            };
//          })
//        });
      });

      describe("stateManagement", function () {
        var root;

        _.chain({
          'single input-output pair':function () {
            root.find('order-with-single-item').done(results.assignTo('order')).fail(results.unexpected);
            root.find('input-tube-1').done(results.assignTo('inputTube')).fail(results.unexpected);
            root.find('output-tube-1').done(results.assignTo('outputTube')).fail(results.unexpected);

            return {
              updates:[
                {
                  input:{ resource:results.get('inputTube'), role:'inputRole', order:results.get('order') },
                  output:{ resource:results.get('outputTube'), role:'outputRole' }
                }
              ]
            };
          },

          'single order with multiple input-output pairs':function () {
            root.find('order-with-two-items').done(results.assignTo('order')).fail(results.unexpected);
            root.find('input-tube-2').done(results.assignTo('inputTube2')).fail(results.unexpected);
            root.find('input-tube-3').done(results.assignTo('inputTube3')).fail(results.unexpected);
            root.find('output-tube-2').done(results.assignTo('outputTube2')).fail(results.unexpected);
            root.find('output-tube-3').done(results.assignTo('outputTube3')).fail(results.unexpected);

            return {
              updates:[
                {
                  input:{ resource:results.get('inputTube2'), role:'inputRole', order:results.get('order') },
                  output:{ resource:results.get('outputTube2'), role:'outputRole' }
                },
                {
                  input:{ resource:results.get('inputTube3'), role:'inputRole', order:results.get('order') },
                  output:{ resource:results.get('outputTube3'), role:'outputRole' }
                }
              ]
            };
          },

          'multiple orders with multiple input-output pairs':function () {
            root.find('order-with-single-item').done(results.assignTo('single-order')).fail(results.unexpected);
            root.find('order-with-two-items').done(results.assignTo('multiple-order')).fail(results.unexpected);
            root.find('input-tube-1').done(results.assignTo('inputTube1')).fail(results.unexpected);
            root.find('input-tube-2').done(results.assignTo('inputTube2')).fail(results.unexpected);
            root.find('input-tube-3').done(results.assignTo('inputTube3')).fail(results.unexpected);
            root.find('output-tube-1').done(results.assignTo('outputTube1')).fail(results.unexpected);
            root.find('output-tube-2').done(results.assignTo('outputTube2')).fail(results.unexpected);
            root.find('output-tube-3').done(results.assignTo('outputTube3')).fail(results.unexpected);

            return {
              updates:[
                {
                  input:{ resource:results.get('inputTube1'), role:'inputRole', order:results.get('single-order') },
                  output:{ resource:results.get('outputTube1'), role:'outputRole' }
                },
                {
                  input:{ resource:results.get('inputTube2'), role:'inputRole', order:results.get('multiple-order') },
                  output:{ resource:results.get('outputTube2'), role:'outputRole' }
                },
                {
                  input:{ resource:results.get('inputTube3'), role:'inputRole', order:results.get('multiple-order') },
                  output:{ resource:results.get('outputTube3'), role:'outputRole' }
                }
              ]
            };
          },

          'multiple orders with duplicated input-output pairs uniques updates':function () {
            root.find('order-with-single-item').done(results.assignTo('single-order')).fail(results.unexpected);
            root.find('order-with-two-items').done(results.assignTo('multiple-order')).fail(results.unexpected);
            root.find('input-tube-1').done(results.assignTo('inputTube1')).fail(results.unexpected);
            root.find('input-tube-2').done(results.assignTo('inputTube2')).fail(results.unexpected);
            root.find('input-tube-3').done(results.assignTo('inputTube3')).fail(results.unexpected);
            root.find('output-tube-1').done(results.assignTo('outputTube1')).fail(results.unexpected);
            root.find('output-tube-2').done(results.assignTo('outputTube2')).fail(results.unexpected);
            root.find('output-tube-3').done(results.assignTo('outputTube3')).fail(results.unexpected);
            root.find('output-tube-4').done(results.assignTo('outputTube4')).fail(results.unexpected);

            return {
              updates:[
                {
                  input:{ resource:results.get('inputTube1'), role:'inputRole', order:results.get('single-order') },
                  output:{ resource:results.get('outputTube1'), role:'outputRole' }
                },
                {
                  input:{ resource:results.get('inputTube2'), role:'inputRole', order:results.get('multiple-order') },
                  output:{ resource:results.get('outputTube2'), role:'outputRole' }
                },
                {
                  input:{ resource:results.get('inputTube3'), role:'inputRole', order:results.get('multiple-order') },
                  output:{ resource:results.get('outputTube3'), role:'outputRole' }
                },
                {
                  input:{ resource:results.get('inputTube3'), role:'inputRole', order:results.get('multiple-order') },
                  output:{ resource:results.get('outputTube4'), role:'outputRole' }
                }
              ]
            };
          }
        }).each(function (setup, name) {
              describe(name, function () {
                var state;

                beforeEach(function () {
                  config.loadTestData(testDataRoot);
                  Root.load({user:"username"}).done(results.assignTo('root')).fail(results.unexpected);
                  root = results.get('root');

                  config.cummulativeLoadingTestDataInFirstStage(testDataOrders);
                  state = setup();
                });

                it("adds the output items during start", function () {
                  Operations.stateManagement().start(state).done(results.expected).fail(results.unexpected);
                  results.expectToBeCalled();
                });

                it("updates both items during complete", function () {
                  Operations.stateManagement().complete(state).done(results.expected).fail(results.unexpected);
                  results.expectToBeCalled();
                })
              });
            });
      });
    });
  });
});
