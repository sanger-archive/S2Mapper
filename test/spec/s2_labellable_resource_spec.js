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

      var s2, labellablePromise;

      describe("modular interface", function () {
        it("should not be labellable", function () {
          expect(LabellableResource.instantiate({rawJson:{actions:{}}}).labelWith).to.be.undefined;
        })
      });

      describe("Searching for a labellable by EAN13 barcode,", function () {
        
        describe("with the tube in the system,", function () {
        
          beforeEach(function (done) {

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
              .fail(results.unexpected)
              .always(done);

          });

          it("it returns a resource.", function () {
            expect(results.get('labellable')).to.be.defined;
          });

          it("the labellable found has a name.", function () {
            expect(results.get('labellable').name).to.be.defined;
          });

          it("and it's correct.", function () {
            expect(results.get('labellable').name).to.equal("11111111-2222-3333-4444-000000000000");
          });
        });

        describe("with the tube NOT in the system,", function () {
          var labellablePromise;

          beforeEach(function (done) {

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
              .fail(results.expected)
              .always(function() {
                done();
              });

          });

          it("the promise has been rejected.", function () {
              expect(labellablePromise.state()).to.equal('rejected')
          });

        });

      })
    })
  })
});
