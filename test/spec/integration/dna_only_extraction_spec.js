define(['config', 'mapper/s2_root', 'text!json/dna_and_rna_manual_extraction.json'], function(config, S2Root,testJSON){
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
      var s2,expectedResponse, tube;
      beforeEach(function(){
        expectedResponse = config.setupTest(testJSON,1,0);
        results             = {};

        S2Root.load().done(assignResultTo('root'));
        s2 = results.root;
        s2.tubes.findByEan13Barcode('XX111111K').done(assignResultTo('tube'));
      });

      it("returns the tube as a tube resource object.", function(){
        expect(tube).toBeDefined();
      });


    });
  });
});
