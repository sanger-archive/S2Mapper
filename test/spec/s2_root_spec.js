define(['config', 'mapper/s2_root'], function(config, S2Root){
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


  xdescribe("S2Root:-", function(){
    var rootPromise;

    describe("Creating a new root resource,", function(){
      beforeEach(function(){
        config.setTestJson('dna_only_extraction');
        rawRootJson         = config.getTestJson('/');
        config.currentStage = 'stage1';
        results             = {};
        rootPromise         = S2Root.load();
        rootPromise.done(assignResultTo('root'));
      });

      it("returns a promise.", function(){
        expect(rootPromise.done).toBeDefined();
      });

      it("resolves to a hash of S2Resources", function(){
        expect(Object.keys(results.root)).
          toEqual(Object.keys(rawRootJson));
      });

      it("has a SearchesResource", function(){
        var resourceType = results.root.searches.resourceType;
        expect(resourceType).toBe('searches');
      });

    });
  });
});
