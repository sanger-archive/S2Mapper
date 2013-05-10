define([
  'resource_test_helper',
  'config',
  'mapper/s2_tube_rack_resource'
], function (TestHelper, config, TubeRackResource) {
  'use strict';

  TestHelper(function (results) {
    describe("Tube Rack Resource:-", function () {
      results.lifeCycle();
      it("should be labellable", function () {
        expect(TubeRackResource.instantiate({rawJson: {actions: {}}}).labelWith).toBeDefined()
      });

      it("is 'batchable'.", function () {
        expect(TubeRackResource.instantiate({rawJson: {actions: {}}}).order).toBeDefined();
      })
    });
  });
});
