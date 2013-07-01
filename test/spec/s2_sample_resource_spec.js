define([ 'resource_test_helper'
  , 'config'
  , 'mapper/s2_root'
  , 'mapper/s2_sample_resource'
  , 'text!json/unit/root.json'
  , 'text!json/unit/sample.json'
], function (TestHelper, config, Root, SampleResource, rootTestJson, sampleTestJson) {
  'use strict';

  TestHelper(function (results) {
    describe("Sample Resource:-", function () {
      results.lifeCycle();
      var s2, samplePromise;


      describe("Searching for a sample by EAN13 barcode,", function () {
        describe("and the sample IS on the system,", function () {
          beforeEach(function () {

            runs(function () {
              config.loadTestData(rootTestJson);
              config.cummulativeLoadingTestDataInFirstStage(sampleTestJson);
              Root.load({user:"username"})
                  .then(function (root) {
                    results.assignTo('root')(root);
                    s2 = results.get('root');
                    return root.samples.findByEan13Barcode('2345678901234');
                  })
                  .then(results.assignTo('sample'))
                  .then(results.expected)
                  .fail(results.unexpected);
            });
            waitsFor(results.hasFinished);
          });

          it("takes an EAN13 barcode and returns the corresponding resource.", function () {
            runs(function () {
              expect(results.get('sample').rawJson).toBeDefined()
            });
          });
        });

        describe("and sample IS NOT on the system,", function () {
          beforeEach(function () {
            runs(function () {
              config.loadTestData(rootTestJson);
              Root.load({user:"username"})
                  .then(function (root) {
                    results.assignTo('root')(root);
                    s2 = results.get('root');
                    config.cummulativeLoadingTestDataInFirstStage(sampleTestJson);
                    samplePromise = s2.samples.findByEan13Barcode('6666666666666'); // we need to save the promise here !
                    return samplePromise;
                  })
                  .then(results.unexpected)
                  .fail(results.expected);
            });
            waitsFor(results.hasFinished);
          });

          it("takes an EAN13 barcode but the returned promise is rejected.", function () {
            runs(function () {
              expect(samplePromise.state()).toBe('rejected')
            });
          })
        })
      });


    });
  });
});
