define([
  'resource_test_helper',
  'config',
  'mapper/s2_spin_column_resource'
], function (TestHelper, config, SpinColumnResource) {
  'use strict';

  TestHelper(function (results) {
    describe("Spin Column Resource:-", function () {
      results.lifeCycle();

      it("should be labellable", function () {
        expect(SpinColumnResource.instantiate({rawJson: {actions: {}}}).labelWith).toBeDefined()
      });

      it("is 'batchable'.", function () {
        expect(SpinColumnResource.instantiate({rawJson: {actions: {}}}).order).toBeDefined();
      })
    });
  });
});
