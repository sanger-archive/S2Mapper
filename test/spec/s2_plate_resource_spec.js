//This file is part of S2 and is distributed under the terms of GNU General Public License version 1 or later;
//Please refer to the LICENSE and README files for information on licensing and authorship of this file.
//Copyright (C) 2013 Genome Research Ltd.
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
