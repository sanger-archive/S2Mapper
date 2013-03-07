define(['config',
    'mapper/s2_root',
    'text!json/dna_and_rna_manual_extraction_1.json'], function(config, S2Root,testJSON_1){
  'use strict';

  // We use an empty object for test results so that we can use a
  // string as a pointer to a returned value.
  var results, rawRootJson;

  function assignResultTo(target){
    return function(source){
      // Assignment through side effect; simultates callback.
      results[target] = source;
    }
  }


  describe("S2Root:-", function(){
    var rootPromise;

    describe("Creating a new root resource,", function(){
      beforeEach(function(){
		rawRootJson = config.setupTest(testJSON_1,0);
        results             = {};
        rootPromise         = S2Root.load();
        rootPromise.done(assignResultTo('root'));
        results.root.find("11111111-2222-3333-4444-555555555555").done(assignResultTo('tube'));
      });

      it("returns a promise.", function(){
        expect(rootPromise.done).toBeDefined();
      });

      it("resolves to a hash of S2Resources.", function(){
        expect(_.difference(Object.keys(rawRootJson), Object.keys(results.root)) ).
          toEqual([]);
      });

      it("has a Searches Resource.", function(){
        var resourceType = results.root.searches.resourceType;
        expect(resourceType).toBe('searches');
      });

      it("can find resources by their UUID", function(){
        expect(results.tube.rawJson).toBeDefined();
      });

    });
  });
});
