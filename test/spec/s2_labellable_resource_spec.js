define([ 'resource_test_helper'
  , 'config'
  , 'mapper/s2_root'
  , 'mapper/s2_labellable_resource'
  , 'text!json/unit/root.json'
  , 'text!json/unit/labellable.json'
], function (TestHelper, config, Root, LabellableResource, rootTestJson, labellableTestJson) {
  'use strict';

  TestHelper(function (results) {
    describe("Labellable Resource:-", function () {
      results.lifeCycle();

      var s2, labellablePromise;

      describe("modular interface", function () {
        it("should not be labellable", function () {
          expect(LabellableResource.instantiate({rawJson:{actions:{}}}).labelWith).toBeUndefined()
        })
      });

      describe("Searching for a tube by EAN13 barcode,", function () {
        describe("and the tube IS on the system,", function () {
          beforeEach(function () {

            runs(function () {
              config.loadTestData(rootTestJson);
              config.cummulativeLoadingTestDataInFirstStage(labellableTestJson);
              Root.load({user:"username"})
                  .then(function (root) {
                    results.assignTo('root')(root);
                    s2 = results.get('root');
                    return root.labellables.findByEan13Barcode('2345678901234');
                  })
                  .then(results.assignTo('labellable'))
                  .then(results.expected)
                  .fail(results.unexpected);
            });
            waitsFor(results.hasFinished);

          });

          it("takes an EAN13 barcode and returns the corresponding resource.", function () {
            runs(function () {
              expect(results.get('labellable')).toBeDefined()
            });
          });
        });

//        xdescribe("and tube IS NOT on the system,", function () {
//          beforeEach(function () {
//            runs(function () {
//              config.loadTestData(rootTestJson);
//              Root.load({user:"username"})
//                  .then(function (root) {
//                    results.assignTo('root')(root);
//                    s2 = results.get('root');
//                    config.cummulativeLoadingTestDataInFirstStage(tubeByBarcodeJson);
//                    tubePromise = s2.tubes.findByEan13Barcode('6666666666666'); // we need to save the promise here !
//                    return tubePromise;
//                  })
//                  .then(results.unexpected)
//                  .fail(results.expected);
//            });
//            waitsFor(results.hasFinished);
//          });
//
//          it("takes an EAN13 barcode but the returned promise is rejected.", function () {
//            runs(function () {
//              expect(tubePromise.state()).toBe('rejected')
//            });
//          })
//        })
      })
//
//      xdescribe("once a tube has been loaded", function () {
//        beforeEach(function () {
//          runs(function () {
//            config.loadTestData(rootTestJson);
//            Root.load({user:"username"})
//                .then(function (root) {
//                  results.assignTo('root')(root);
//                  s2 = results.get('root');
//                  config.cummulativeLoadingTestDataInFirstStage(tubeByBarcodeJson);
//                  return root.tubes.findByEan13Barcode('2345678901234');
//                })
//                .then(results.assignTo('tube'))
//                .then(results.expected)
//                .fail(results.unexpected);
//          });
//          waitsFor(results.hasFinished);
//        });
//
//        describe(".order()", function () {
//          it("resolves to an order resource.", function () {
//            runs(function () {
//              results.resetFinishedFlag();
//              results.get('tube').order()
//                  .then(results.assignTo('order'))
//                  .then(results.expected)
//                  .fail(results.unexpected)
//            });
//
//            waitsFor(results.hasFinished);
//
//            runs(function () {
//              expect(results.get('order').resourceType).toBe('order');
//            })
//          })
//        })
//      })
    })
  })
})
