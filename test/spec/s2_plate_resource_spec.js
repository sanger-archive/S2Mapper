define([
  'resource_test_helper',
  'config',
  'mapper/s2_plate_resource'
], function (TestHelper, config, PlateResource) {
  'use strict';

  TestHelper(function (results) {;
    describe("Plate Resource:-", function () {
      results.lifeCycle();
      it("should be labellable", function () {
        expect(PlateResource.instantiate({rawJson: {actions: {}}}).labelWith).to.be.defined;
      });

      it("is 'batchable'.", function () {
        expect(PlateResource.instantiate({rawJson: {actions: {}}}).order).to.be.defined;
      })
    });
  });
});
