//This file is part of S2 and is distributed under the terms of GNU General Public License version 1 or later;
//Please refer to the LICENSE and README files for information on licensing and authorship of this file.
//Copyright (C) 2013 Genome Research Ltd.
define([
  'resource_test_helper',
  'config',
  'mapper/s2_root',
  'text!json/unit/barcode.json',
  'mapper/s2_labeling_module',
  'mapper/s2_barcode_resource'
], function (TestHelper, config, Root, testData, LabelingModule) {
  'use strict';

  TestHelper(function (results) {
    describe('S2BarcodeResource', function () {
      results.lifeCycle();

      // Setup the environment for the S2 javascript
      var s2;

      // Ensure that the root JSON is always processed and we have that available
      beforeEach(function (done) {

        var expectedResponse = config.loadTestData(testData);

        Root.load({user:"username"})
          .then(function (root) {
            results.assignTo('root')(root);
            s2 = results.get('root');
          })
          .then(results.expected)
          .fail(results.unexpected)
          .always(done);

      });

      describe('create', function () {

        beforeEach(function (done) {
          results.resetFinishedFlag();

          s2.barcodes.create({
            "labware":"tube",
            "role":"stock",
            "contents":"DNA"
          })
            .then(results.assignTo("barcode"))
            .then(results.expected)
            .fail(results.unexpected)
            .always(done);
        });

        it("has an EAN13 barcode", function () {
          expect(results.get('barcode').ean13).to.be.defined;
        });

        it("has a structured Sanger barcode", function () {
          expect(results.get('barcode').sanger).to.be.defined;
        });

        it("has a string representation of the Sanger barcode", function () {
          expect(results.get('barcode').sangerBarcode).to.equal("DN1234567K");
        });
      });

      describe('label', function () {

        beforeEach(function (done) {
          results.resetFinishedFlag();
          var resource = { root:s2, uuid:"UUID OF RESOURCE" }
          $.extend(resource, LabelingModule);

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
            .always(done);

        });

        it("attaches barcode labels to resources", function () {
          expect(results.get('labellable')).to.be.defined;
        });
        
      });
    });
  });
});
