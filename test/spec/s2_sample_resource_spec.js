//This file is part of S2 and is distributed under the terms of GNU General Public License version 1 or later;
//Please refer to the LICENSE and README files for information on licensing and authorship of this file.
//Copyright (C) 2013 Genome Research Ltd.
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

      var s2, samplePromise;

      // Pending: you can't search for a sample by EAN13 as it's not
      // labware.
      // find(UUID) should work it needs to be updated to use
      // lims-management for searches not lims-laboratory.
      xdescribe("Searching for a sample by EAN13 barcode,", function () {

        describe("and the sample IS on the system,", function () {

          beforeEach(function (done) {
            var self = this;
            
            config.loadTestData(rootTestJson);
            config.cummulativeLoadingTestDataInFirstStage(sampleTestJson);
            
            Root.load({user:"username"})
              .then(function (root) {
                results.assignTo('root')(root);
                s2 = results.get('root');
                return root.samples.find('sampleUUID');
              })
              .then(function(result) {
                self.sample = result;
              },results.unexpected)
              .always(done);

          });

          it("takes an EAN13 barcode and returns the corresponding resource.", function () {
            expect(this.sample.rawJson).to.be.defined;
          });
        });

        describe("and sample IS NOT on the system,", function () {
          
          beforeEach(function (done) {
            
            config.loadTestData(rootTestJson);
            
            Root.load({user:"username"})
              .then(function (root) {
                s2 = root;

                config.cummulativeLoadingTestDataInFirstStage(sampleTestJson);
                
                samplePromise = s2.samples.find('NotAValidsampleUUID'); // we need to save the promise here !
                
                return samplePromise;
              })
              .then(results.unexpected)
              .fail(results.expected)
              .always(done);
          });

          it("takes an EAN13 barcode but the returned promise is rejected.", function () {
            expect(samplePromise.state()).to.equal('rejected')
          })
        })
      });


    });
  });
});
