//This file is part of S2 and is distributed under the terms of GNU General Public License version 1 or later;
//Please refer to the LICENSE and README files for information on licensing and authorship of this file.
//Copyright (C) 2013 Genome Research Ltd.
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
        expect(SpinColumnResource.instantiate({rawJson: {actions: {}}}).labelWith).to.be.defined
      });

      it("is 'batchable'.", function () {
        expect(SpinColumnResource.instantiate({rawJson: {actions: {}}}).order).to.be.defined;
      })
    });
  });
});
