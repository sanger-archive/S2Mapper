//This file is part of S2 and is distributed under the terms of GNU General Public License version 1 or later;
//Please refer to the LICENSE and README files for information on licensing and authorship of this file.
//Copyright (C) 2013,2014 Genome Research Ltd.
define([
  'resource_test_helper',
  'config',
  'mapper/s2_root',
  'text!json/unit/root.json',
  'text!json/unit/tube.json',
  'text!json/unit/order_with_batch.json'
], function (TestHelper, config, S2Root, rootTestJson, tubeTestJson, orderTestJson) {
  'use strict';

  var rawRootJson;

  TestHelper(function (results) {
    xdescribe("S2Root:-", function () {
      results.lifeCycle();

      describe("Loading an S2 root,", function () {
        var rootPromise;

        beforeEach(function (done) {
          config.loadTestData(rootTestJson);

          rawRootJson = config.testData[config.defaultStage]["calls"][0].response;

          rootPromise = S2Root.load({user:"username"})
            .then(results.assignTo('root'))
            .then(results.expected)
            .fail(results.unexpected)
            .always(done);
        });

        it("returns a promise.", function () {
          expect(rootPromise.hasOwnProperty("resolve")).to.be.defined;
          expect(rootPromise.hasOwnProperty("reject")).to.be.defined;
          expect(rootPromise.hasOwnProperty("promise")).to.be.defined;
        });

        it("has a SearchesResource", function () {
          var resourceType = results.get('root')["laboratorySearches"].resourceType;
          expect(resourceType).to.equal('search');
        });

        // All of these are supposed to be actions, not root level resources.
        var resourcesThatAreActions = [
          'create_batches', 'create_flowcells', 'create_gels', 'create_labels', 'create_labellables',
          'create_orders', 'create_plates', 'create_searches', 'create_spin_columns', 'create_tubes',
          'create_tube_racks', 'plate_transfers', 'tag_wells', 'transfer_plates_to_plates', 'transfer_tubes_to_tubes',
          'transfer_wells_to_tubes', 'tube_rack_moves', 'tube_rack_transfers', 'update_orders', 'update_plates',
          'update_tubes', 'update_tube_racks'
        ];

        // These resources are removed or dropped
        var resourcesThatAreDropped = [
          'revision'
        ];

        // These resources are removed or dropped
        var oldResourcesOnTheRoot = [
            'laboratory-searches'
          , 'support-searches'
        ];

        function bidirectionalDifference(a, b) {
          return _.union(_.difference(a, b), _.difference(b, a));
        }

        it("has the appropriate root level resourcs", function () {

          expect(bidirectionalDifference(
            _.chain(rawRootJson).keys().map(function(r){return r.removeHyphen()}).difference(resourcesThatAreDropped).difference(resourcesThatAreActions).union(['actions', 'user']).value(),
            _.difference(_.keys(results.get('root'), oldResourcesOnTheRoot))
          )).to.deep.equal([]);
        });

        it("has the appropriate actions", function () {
          expect(bidirectionalDifference(
            resourcesThatAreActions,
            _.keys(results.get('root').actions)
          )).to.deep.equal([]);
        });
      });

      describe('find', function () {
        var resourceTests = [
          { resourceType:'tube', uuid:'3bcf8010-68ac-0130-9163-282066132de2', data:tubeTestJson  },
          { resourceType:'order', uuid:'25ec5e30-67b1-0130-915d-282066132de2', data:orderTestJson }
        ];

        for (var index in resourceTests) {
          var resourceTest = resourceTests[index];

          describe(resourceTest.resourceType + " resource", function () {
            var expectedResponse;

            beforeEach(function (done) {
              config.cummulativeLoadingTestDataInFirstStage(resourceTest.data);
              
              expectedResponse = config.testData[config.defaultStage]["calls"][0].response;
              
              S2Root.load({user:"username"})
                .then(results.assignTo('root'))
                .then(function () {
                  return results.get('root').find(resourceTest.uuid);
                })
                .then(results.assignTo('resource'))
                .then(results.expected)
                .fail(results.unexpected)
                .always(done)
            });

            it("is " + resourceTest.resourceType + " resource", function () {
              expect(results.get('resource').resourceType).to.equal(resourceTest.resourceType);
            });

            it("sets the root", function () {
                expect(results.get('resource').root).to.be.defined;
            });

          });
        }
      });
    });
  });
});
