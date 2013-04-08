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

        Root.load({user:"username"}).done(results.assignTo('root'));
        s2 = results.get('root');
      });

      describe('create', function () {
        beforeEach(function () {
          s2.barcodes.create({
            "labware":"tube",
            "role":"stock",
            "contents":"DNA"
          }).done(results.assignTo("barcode"));
        });

        it("has an EAN13 barcode", function () {
          expect(results.get('barcode').ean13).toBeDefined();
        });

        it("has a structured Sanger barcode", function () {
          expect(results.get('barcode').sanger).toBeDefined();
        });

        it("has a string representation of the Sanger barcode", function () {
          expect(results.get('barcode').sangerBarcode).toEqual("DN1234567K");
        });
      });

      describe('label', function () {
        beforeEach(function () {
          var resource = { root:s2, uuid:"UUID OF RESOURCE" }
          $.extend(resource, Labellable);

          s2.barcodes.create({
            "labware":"tube",
            "role":"stock",
            "contents":"DNA"
          }).done(function (barcode) {
                barcode.label(resource).done(results.assignTo('labellable'));
              });
        });

        it("attaches barcode labels to resources", function () {
          expect(results.get('labellable')).toBeDefined();
        });
      });
    });
  });
});
