define([
  'config',
  'mapper/s2_root',
  'text!json/barcode_data_1.json',
  'mapper/s2_barcode_resource'
], function(config, Root, testJSON_stage1) {
  'use strict';

  // Boiler plate setup for dealing with the futures & promises in testing
  var results = {};
  function assignResultTo(target) {
    return function(r) { results[target] = r; };
  }

  describe('S2BarcodeResource', function() {
    // Setup the environment for the S2 javascript
    var s2, expectedResponse;

    // Ensure that the root JSON is always processed and we have that available
    beforeEach(function() {
      expectedResponse = config.setupTest(testJSON_stage1, 0);

      results = {};
      Root.load().done(assignResultTo('root'));
      s2 = results.root;
    });

    describe('create', function() {
      it("returns both an EAN13 and a Sanger barcode", function() {
        s2.barcodes.create({
          "barcode": {
            "labware": "tube",
            "role": "stock",
            "contents": "DNA"
          }
        }).done(assignResultTo("barcode"));

        expect(results.barcode.ean13).toBeDefined();
        expect(results.barcode.sanger).toBeDefined();
      });

      it("includes a convenience method for the sanger barcode", function() {
        s2.barcodes.create({
          "barcode": {
            "labware": "tube",
            "role": "stock",
            "contents": "DNA"
          }
        }).done(assignResultTo("barcode"));

        expect(results.barcode.sangerBarcode).toEqual("DN1234567K");
      });

/*
      it("requires the type of the labware", function() {
        expect(function() {

        }).toThrow();
      });
      it("requires the role of the labware", function() {
        expect(function() {

        }).toThrow();
      });
      it("requires the type of the contents", function() {
        expect(function() {

        }).toThrow();
      });
*/
    });
  });
});
