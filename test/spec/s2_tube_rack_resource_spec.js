define([
  'resource_test_helper'
  , 'config'
  , 'mapper/s2_root'
  , 'mapper/s2_tube_rack_resource'
  , 'text!json/unit/root.json'
  , 'text!json/unit/tube_rack.json'
  , 'text!json/unit/order_without_batch.json'], function (TestHelper, config, Root, TubeRackResource, rootTestJson, tubeRackTestJson) {
  'use strict';

  TestHelper(function (results) {
    describe("Tube Rack Resource:-", function () {
      beforeEach(function (done) {
        var self = this;

        config.loadTestData(rootTestJson);
        config.cummulativeLoadingTestDataInFirstStage(tubeRackTestJson);
        done();

        /*Root.load({user:"username"})
          .then(function (root) {
            results.assignTo('root')(root);
            var s2 = results.get('root');
            return root.tubes.searchByBarcode().ean13('1234567890123').first();
          })
          .then(function(res) {
            self.tube = res
          })
          .then(results.expected)
          .fail(results.unexpected)
          .always(done);
*/
      })
      
      results.lifeCycle();
      it("should be labellable", function () {
        expect(TubeRackResource.instantiate({rawJson: {actions: {}}}).labelWith).to.be.defined
      });

      it("is 'batchable'.", function () {
        expect(TubeRackResource.instantiate({rawJson: {actions: {}}}).order).to.be.defined;
      });
      
      it("orders for all the tubes", function(done) {
        Root.load({user:"username"}).then(function(root) {
          return root.findByLabEan13('1234567890123');
        }).then(function(rack) {
          var ordersPromises = rack.allOrdersFromTubes();
          expect(ordersPromises.length).to.equal(1);
          $.when.apply(this, ordersPromises).then(function() {
            var orders = arguments;
            expect(orders.length).to.equal(1);
            done();
          })
        });
      });
    });
  });
});
