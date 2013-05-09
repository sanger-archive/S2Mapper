define([
  'resource_test_helper',
  'config',
  'mapper/s2_root',
  'mapper/s2_kit_resource',
  'text!json/unit/root.json',
  'text!json/unit/kit_spec_data/searching.json'
], function (TestHelper, config, Root, KitResource, rootData, searchingData) {
  'use strict';

  TestHelper(function (results) {
    describe("Kit Resource:-", function () {
      results.lifeCycle();

      describe("modular interface", function () {
        it("should NOT be labellable", function () {
          expect(KitResource.instantiate({rawJson:{actions:{}}})).not.toBeDefined()
        });
        it("should be labellable", function () {
          runs(function () {
            config.loadTestData(rootData);
            var s2;
            Root.load({user:"username"})
                .then(results.assignTo('root'))
                .then(function () {
                  s2 = results.get('root');
                  config.cummulativeLoadingTestDataInFirstStage(searchingData);
                  return s2.kits.findByBarcode();
                }).then(results.expected)
                .fail(results.unexpected);
          });
          waitsFor(results.hasFinished);

          runs(function(){
            expect(results.get('results')).toEqual('first page');
          });

//          var kitInstance = KitResource.instantiate({rawJson:{actions:{}}});
//          expect(kitInstance.findByBarcode).toBeDefined();
//          kitInstance.findByBarcode();

        })
      });
    });
  });
});
