define(['config', 'mapper/s2_root'], function(config, S2Root){
  'use strict';

  function assignResultTo(target){
    return function(source){
      // Assignment through side effect; simultates callback.
      results[target] = source;
    }
  }

  var rawJson, results ;
  describe("INTEGRATION:  DNA only manual extraction:-", function(){

    describe("Searching for an input tube by it's EAN13 barcode,", function(){
      var s2;
      beforeEach(function(){

        config.setTestJson('dna_only_extraction');

        config.currentStage = 'stage1';
        results             = {};

        S2Root.load().done(assignResultTo('root'));
        s2 = results.root;
        s2.tubes.findByEan13Barcode('2345678901234').done(assignResultTo('tube'));
      });

      it("returns the tube as a tube resource object.", function(){
        expect(results.tube).toBeDefined();
      });


    });
  });
});
