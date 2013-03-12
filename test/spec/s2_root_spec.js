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
          rootPromise         = S2Root.load();
          rootPromise.done(assignResultTo('root'));
        });

        it("returns a promise.", function(){
          expect(rootPromise.done).toBeDefined();
        });

        it("resolves to a hash of S2Resources", function(){
          expect(Object.keys(results.get('root'))).
            toEqual(Object.keys(expectedResponse));
        });

        it("has a SearchesResource", function(){
          var resourceType = results.get('root').searches.resourceType;
          expect(resourceType).toBe('searches');
        });

        it("resolves to a hash of S2Resources.", function(){
          var diffExpectedWithRoot = _.difference(
            Object.keys(rawRootJson),
            Object.keys(results.get('root'))
          );

          expect(diffExpectedWithRoot).toEqual([]);
        });
      });

      describe('find', function(){
        var resourceTests = [
          { resourceType: 'tube',  uuid: '3bcf8010-68ac-0130-9163-282066132de2', data: [tubeData,0] },
          { resourceType: 'order', uuid: '25ec5e30-67b1-0130-915d-282066132de2', data: [dnaAndRnaManualExtractionData,1] }
        ]
        for (var index in resourceTests) {
          var resourceTest = resourceTests[index];

          describe(resourceTest.resourceType + " resource", function() {
            var expectedResponse;

            beforeEach(function() {
              expectedResponse = config.setupTest(resourceTest.data[0], resourceTest.data[1]);
              S2Root.load().done(results.assignTo('root'));
              results.get('root').find(resourceTest.uuid).done(results.assignTo('resource'));
            });

            it("is " + resourceTest.resourceType + " resource", function() {
              expect(results.get('resource').resourceType).toBe(resourceTest.resourceType);
            });

            it("does not set the root when unspecified", function() {
              expect(results.get('resource').root).toBeUndefined();
            });

            it("sets the rawJson", function() {
              expect(results.get('resource').rawJson).toBe(expectedResponse);
            });

            it("establishes all of the actions", function() {
              for (var action in expectedResponse[resourceTest.resourceType].actions) {
                expect(typeof results.get('resource')[action]).toBe('function');
              }
            });
          });
        }
      });
    });
  });
});
