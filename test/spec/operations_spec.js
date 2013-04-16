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

          runs(function () {
            results.resetFinishedFlag();
            Root.load({user:"username"})
              .then(results.assignTo('root'))
              .then(function () {
                root = results.get('root');
              })
              .then(results.expected)
              .fail(results.unexpected);

          });
          waitsFor(results.hasFinished);


          config.cummulativeLoadingTestDataInFirstStage(testDataOrders);
        });

        it("passes the attributes to the labware constructor", function () {
          runs(function () {
            results.resetFinishedFlag();
            Operations.registerLabware(
              root.tubes,
              'DNA',
              'stock',
              { 'foo':'bar' }
            )
              .then(results.expected)
              .fail(results.unexpected);
          });
          waitsFor(results.hasFinished);
        });

        describe("performs create labware -> create barcode -> label labware", function () {
          var state;

          beforeEach(function () {
            results.resetFinishedFlag();
            runs(function () {
              Operations.registerLabware(
                root.tubes,
                'DNA',
                'stock'
              )
                .then(results.assignTo('state'))
                .then(function () {
                  state = results.get('state');
                })
                .then(results.expected)
                .fail(results.unexpected);
            })
            waitsFor(results.hasFinished);

          });

          it("outputs the labware", function () {
            runs(function () {
              expect(state.labware).toBeDefined();
            })
          });

          it("outputs the barcode", function () {
            runs(function () {
              expect(state.barcode).toBeDefined();
            });
          });
        });


      });

      describe("betweenLabware", function () {
        var root;

        beforeEach(function () {
          results.resetFinishedFlag();

          runs(function () {
            config.loadTestData(testDataRoot);
            Root.load({user:"username"})
              .then(results.assignTo('root'))
              .then(function () {
                root = results.get('root');
                config.cummulativeLoadingTestDataInFirstStage(testDataOrders);
                return root.find('order-with-single-item');
              })
              .then(results.assignTo('order'))
              .then(function () {
                return root.find('input-tube-1');
              })
              .then(results.assignTo('inputTube'))
              .then(function () {
                return root.find('output-tube-1');
              })
              .then(results.assignTo('outputTube'))
              .then(results.expected)
              .fail(results.unexpected);
          });
          waitsFor(results.hasFinished);


        });

        it("handles simple tube-to-tube transfer", function () {
          runs(function () {
            results.resetFinishedFlag();
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
          })
          waitsFor(results.hasFinished);

        });
      });

      describe("stateManagement", function () {
        var root;

        _.chain({
          'single input-output pair':function () {
            root.find('order-with-single-item')
              .then(results.assignTo('order'))
              .then(function () {
                return root.find('input-tube-1');
              })
              .then(results.assignTo('inputTube'))
              .then(function () {
                return root.find('output-tube-1');
              })
              .then(results.assignTo('outputTube'))
              .then(function () {
                return {
                  updates:[
                    {
                      input:{ resource:results.get('inputTube'), role:'inputRole', order:results.get('order') },
                      output:{ resource:results.get('outputTube'), role:'outputRole' }
                    }
                  ]
                };
              })
              .then(results.assignTo('wholeUpdate'))
              .then(results.expected)
              .fail(results.unexpected);

          },

          'single input-output pair setting batch':function () {
            root.find('order-with-single-item')
              .then(results.assignTo('order'))
              .then(function () {
                return root.find('input-tube-1');
              })
              .then(results.assignTo('inputTube'))
              .then(function () {
                return root.find('output-tube-1');
              })
              .then(results.assignTo('outputTube'))
              .then(function () {
                return {
                  updates:[
                    {
                      input:{ resource:results.get('inputTube'), role:'inputRole', order:results.get('order') },
                      output:{ resource:results.get('outputTube'), role:'outputRole', batch:'batch_uuid' }
                    }
                  ]
                };
              })
              .then(results.assignTo('wholeUpdate'))
              .then(results.expected)
              .fail(results.unexpected);


          },

          'single order with multiple input-output pairs':function () {
            root.find('order-with-two-items')
              .then(results.assignTo('order'))
              .then(function () {
                return root.find('input-tube-2');
              })
              .then(results.assignTo('inputTube2'))
              .then(function () {
                return root.find('input-tube-3');
              })
              .then(results.assignTo('inputTube3'))
              .then(function () {
                return root.find('output-tube-2');
              })
              .then(results.assignTo('outputTube2'))
              .then(function () {
                return root.find('output-tube-3');
              })
              .then(results.assignTo('outputTube3'))
              .then(function () {
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
              })
              .then(results.assignTo('wholeUpdate'))
              .then(results.expected)
              .fail(results.unexpected);
          },

          'multiple orders with multiple input-output pairs':function () {
            root.find('order-with-single-item')
              .then(results.assignTo('single-order'))
              .then(function () {
                return root.find('order-with-two-items');
              })
              .then(results.assignTo('multiple-order'))
              .then(function () {
                return root.find('input-tube-1');
              })
              .then(results.assignTo('inputTube1'))
              .then(function () {
                return root.find('input-tube-2');
              })
              .then(results.assignTo('inputTube2'))
              .then(function () {
                return root.find('input-tube-3');
              })
              .then(results.assignTo('inputTube3'))
              .then(function () {
                return root.find('output-tube-1');
              })
              .then(results.assignTo('outputTube1'))
              .then(function () {
                return root.find('output-tube-2');
              })
              .then(results.assignTo('outputTube2'))
              .then(function () {
                return root.find('output-tube-3');
              })
              .then(results.assignTo('outputTube3'))
              .then(function () {
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
              })
              .then(results.assignTo('wholeUpdate'))
              .then(results.expected)
              .fail(results.unexpected);


          },

          'multiple orders with duplicated input-output pairs uniques updates':function () {
            //results.resetFinishedFlag();
            root.find('order-with-single-item')
              .then(results.assignTo('single-order'))
              .then(function () {
                return root.find('order-with-two-items');
              })
              .then(results.assignTo('multiple-order'))
              .then(function () {
                return root.find('input-tube-1');
              })
              .then(results.assignTo('inputTube1'))
              .then(function () {
                return root.find('input-tube-2');
              })
              .then(results.assignTo('inputTube2'))
              .then(function () {
                return root.find('input-tube-3');
              })
              .then(results.assignTo('inputTube3'))
              .then(function () {
                return root.find('output-tube-1');
              })
              .then(results.assignTo('outputTube1'))
              .then(function () {
                return root.find('output-tube-2');
              })
              .then(results.assignTo('outputTube2'))
              .then(function () {
                return root.find('output-tube-3');
              })
              .then(results.assignTo('outputTube3'))
              .then(function () {
                return root.find('output-tube-4');
              })
              .then(results.assignTo('outputTube4'))
              .then(function () {
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
              })
              .then(results.assignTo('wholeUpdate'))
              .then(results.expected)
              .fail(results.unexpected);
          }
        }).each(function (setup, name) {
            describe(name, function () {
              var state;

              beforeEach(function () {
                runs(function () {
                  results.reset();
                  config.loadTestData(testDataRoot);
                  Root.load({user:"username"})
                    .then(results.assignTo('root'))
                    .then(function () {
                      root = results.get('root');
                      config.cummulativeLoadingTestDataInFirstStage(testDataOrders);
                    })
                    .then(results.expected)
                    .fail(results.unexpected);
                });

                waitsFor(results.hasFinished);


                runs(function () {
                  results.resetFinishedFlag();
                  setup();
                });
                waitsFor(results.hasFinished);
                runs(function () {
                  state = results.get('wholeUpdate');
                });
              });

              it("adds the output items during start", function () {
                runs(function () {
                  results.resetFinishedFlag();
                  Operations.stateManagement()
                    .start(state)
                    .then(results.expected)
                    .fail(results.unexpected);
                });

                waitsFor(results.hasFinished);

                runs(function () {
                  results.expectToBeCalled();
                })


              });

              it("updates both items during complete", function () {
                runs(function () {
                  results.resetFinishedFlag();
                  Operations.stateManagement()
                    .complete(state)
                    .then(results.expected)
                    .fail(results.unexpected);
                });

                waitsFor(results.hasFinished);

                runs(function () {
                  results.expectToBeCalled();
                });
              });
            });
          });
      });
    });
  });
})
;
