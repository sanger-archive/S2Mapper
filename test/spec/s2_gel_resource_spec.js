define([
  'resource_test_helper',
  'config',
  'mapper/s2_gel_resource'
], function (TestHelper, config, GelResource) {
  'use strict';

  TestHelper(function (results) {
    describe("Gel Resource:-", function () {
      results.lifeCycle();
      it("should be labellable", function () {
        expect(GelResource.instantiate({rawJson: {actions: {}}}).labelWith).to.be.defined;
      });

      it("is 'batchable'.", function () {
        expect(GelResource.instantiate({rawJson: {actions: {}}}).order).to.be.defined;
      })
    });
  });
});
