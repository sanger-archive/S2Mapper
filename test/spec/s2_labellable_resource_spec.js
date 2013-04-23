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

      describe("Searching for a labellable by EAN13 barcode,", function () {
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

          it("it returns a resource.", function () {
            runs(function () {
              expect(results.get('labellable')).toBeDefined()
            });
          });

          it("the found labellable found has a name.", function () {
            runs(function () {
              expect(results.get('labellable').name).toBeDefined();
            });
          });

          it("and it's correct.", function () {
            runs(function () {
              expect(results.get('labellable').name).toEqual("11111111-2222-3333-4444-000000000000");
            });
          });
        });

        describe("and the tube IS NOT on the system,", function () {
          var labellablePromise;

          beforeEach(function () {

            runs(function () {
              config.loadTestData(rootTestJson);
              config.cummulativeLoadingTestDataInFirstStage(labellableTestJson);
              Root.load({user:"username"})
                  .then(function (root) {
                    results.assignTo('root')(root);
                    s2 = results.get('root');
                    labellablePromise = root.labellables.findByEan13Barcode('NOT THERE');
                    return labellablePromise;
                  })
                  .then(results.assignTo('labellable'))
                  .then(results.unexpected)
                  .fail(results.expected);
            });
            waitsFor(results.hasFinished);

          });

          it("the promise has been rejected.", function () {
            runs(function () {
              expect(labellablePromise.state()).toBe('rejected')
            });
          });

        });

      })
    })
  })
});
