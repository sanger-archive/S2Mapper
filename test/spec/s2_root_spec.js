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

        results             = {};
        rootPromise         = S2Root.load();
        rootPromise.done(assignResultTo('root'));
      });

      it("returns a promise.", function(){
        expect(rootPromise.done).toBeDefined();
      });

      it("resolves to a hash of S2Resources", function(){
        var expectedResponse = config.setupTest(testJSON_1,0);
        expect(Object.keys(results.root)).
          toEqual(Object.keys(expectedResponse));
      });

      it("has a SearchesResource", function(){
        var resourceType = results.root.searches.resourceType;
        expect(resourceType).toBe('searches');
      });

    });
  });
});
