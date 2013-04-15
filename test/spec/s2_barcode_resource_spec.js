define([
  'resource_test_helper',
  'config',
  'mapper/s2_root',
  'text!json/unit/barcode.json',
  'mapper/s2_labellable',
  'mapper/s2_barcode_resource'
], function (TestHelper, config, Root, testData, Labellable) {
  'use strict';

  TestHelper(function (results) {
    describe('S2BarcodeResource', function () {
      results.lifeCycle();

      // Setup the environment for the S2 javascript
      var s2;

      // Ensure that the root JSON is always processed and we have that available
      beforeEach(function () {
        var expectedResponse = config.loadTestData(testData);

        runs(function () {
          Root.load({user:"username"})
            .then(function (root) {
              results.assignTo('root')(root);
              s2 = results.get('root');
            })
            .then(results.expected)
            .fail(results.unexpected);
        })

        waitsFor(results.hasFinished);

      });

      describe('create', function () {
        beforeEach(function () {
          results.resetFinishedFlag();
          runs(function () {
            s2.barcodes.create({
              "labware":"tube",
              "role":"stock",
              "contents":"DNA"
            })
              .then(results.assignTo("barcode"))
              .then(results.expected)
              .fail(results.unexpected)
          });

          waitsFor(results.hasFinished);
        });

        it("has an EAN13 barcode", function () {

          runs(function () {
            expect(results.get('barcode').ean13).toBeDefined();
          });
        });

        it("has a structured Sanger barcode", function () {
          runs(function () {
            expect(results.get('barcode').sanger).toBeDefined();
          });
        });

        it("has a string representation of the Sanger barcode", function () {
          runs(function () {
            expect(results.get('barcode').sangerBarcode).toEqual("DN1234567K");
          });
        });
      });

      describe('label', function () {
        beforeEach(function () {
          results.resetFinishedFlag();
          var resource = { root:s2, uuid:"UUID OF RESOURCE" }
          $.extend(resource, Labellable);

          runs(function () {
            s2.barcodes.create({
              "labware":"tube",
              "role":"stock",
              "contents":"DNA"
            })
              .then(function (barcode) {
                barcode.label(resource)
                  .then(results.assignTo('labellable'))
                  .then(results.expected)
                  .fail(results.unexpected)
              })
          });
          waitsFor(results.hasFinished);

        });

        it("attaches barcode labels to resources", function () {
          runs(function () {
            expect(results.get('labellable')).toBeDefined();
          });
        });
      });
    });
  });
});
