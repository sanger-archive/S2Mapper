define(['config', 'mapper/s2_root'], function(config, S2Root){
  'use strict';

  // We use an empty object for test results so that we can use a
  // string as a pointer to a returned value.
  var results;

  function assignResultTo(target){
    return function(source){ 
      // Assignment through side effect; simultates callback.
      results[target] = source;
    }
  }


  describe("S2Root:-", function(){
    var rootPromise;

    beforeEach(function(){
      config.setTestJson('dna_only_extraction');
      config.currentStage = 'stage1';

      results = {};
      rootPromise = S2Root.create();
      rootPromise.done(assignResultTo('root'));
    });

    describe("Creating a new root resource,", function(){
      it("returns a promise.", function(){
        expect(rootPromise.done).toBeDefined();
      });

      it("resolves to a hash of S2Resources", function(){
        expect(results.root).toBeDefined();
      });


    });
  });
});
