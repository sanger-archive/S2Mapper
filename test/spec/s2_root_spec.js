define([
       'resource_test_helper',
       'config',
       'mapper/s2_root',
       'text!json/unit/root.json',
       'text!json/unit/tube.json',
       'text!json/unit/order_with_batch.json'
], function(TestHelper, config, S2Root, rootTestJson, tubeTestJson, orderTestJson){
  'use strict';

  var rawRootJson;

  TestHelper(function(results) {
    describe("S2Root:-", function(){
      results.lifeCycle();

      describe("Loading an S2 root,", function(){
        var rootPromise;

        beforeEach(function(){
          rawRootJson = config.setupTest(rootTestJson);
          rootPromise         = S2Root.load({user:"username"});
          rootPromise.done(results.assignTo('root'));
        });

        it("returns a promise.", function(){
          expect(rootPromise.done).toBeDefined();
        });

        it("has a SearchesResource", function(){
          var resourceType = results.get('root').searches.resourceType;
          expect(resourceType).toBe('search');
        });

        // All of these are supposed to be actions, not root level resources.
        var resourcesThatAreActions = [
           'create_batches',          'create_flowcells', 'create_gels',         'create_labels',             'create_labellables',
           'create_orders',           'create_plates',    'create_searches',     'create_spin_columns',       'create_tubes',
           'create_tube_racks',       'plate_transfers',  'tag_wells',           'transfer_plates_to_plates', 'transfer_tubes_to_tubes',
           'transfer_wells_to_tubes', 'tube_rack_moves',  'tube_rack_transfers', 'update_orders',             'update_plates',
           'update_tubes',            'update_tube_racks'
        ];

        function bidirectionalDifference(a,b) {
          return _.union(_.difference(a, b), _.difference(b, a));
        }

        it("has the appropriate root level resourcs", function() {
          expect(bidirectionalDifference(
            _.union(_.difference(_.keys(rawRootJson), resourcesThatAreActions), ['actions','user']),
            _.keys(results.get('root'))
          )).toEqual([]);
        });

        it("has the appropriate actions", function() {
          expect(bidirectionalDifference(
            resourcesThatAreActions,
            _.keys(results.get('root').actions)
          )).toEqual([]);
        });
      });

      describe('find', function(){
        var resourceTests = [
          { resourceType: 'tube',  uuid: '3bcf8010-68ac-0130-9163-282066132de2', data: tubeTestJson  },
          { resourceType: 'order', uuid: '25ec5e30-67b1-0130-915d-282066132de2', data: orderTestJson }
        ]
        for (var index in resourceTests) {
          var resourceTest = resourceTests[index];

          describe(resourceTest.resourceType + " resource", function() {
            var expectedResponse;

            beforeEach(function() {
              expectedResponse = config.setupTest(resourceTest.data);
              S2Root.load({user:"username"}).done(results.assignTo('root'));
              results.get('root').find(resourceTest.uuid).done(results.assignTo('resource'));
            });

            it("is " + resourceTest.resourceType + " resource", function() {
              expect(results.get('resource').resourceType).toBe(resourceTest.resourceType);
            });

            it("sets the root", function() {
              expect(results.get('resource').root).toBeDefined();
            });
          });
        }
      });
    });
  });
});
