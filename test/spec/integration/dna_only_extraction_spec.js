define(['config'
  ,'mapper/s2_root'
  ,'text!json/dna_and_rna_manual_extraction_1.json'
  ,'text!json/dna_and_rna_manual_extraction_2.json'
  ,'text!json/tube_data_1.json'],
    function(config, S2Root,rootJSON,testJSON_2,tubeData){
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

        expectedResponse = config.setupTest(rootJSON,0);

        results             = {};

        S2Root.load().done(assignResultTo('root'));

        s2 = results.root;

        expectedResponse = config.setupTest(testJSON_2,0);
        s2.tubes.findByEan13Barcode('XX111111K').done(assignResultTo('tube'));

      });

      it("returns the tube as a tube resource object.", function(){
        expect(results.tube).toBeDefined();
      });


    });
  });
});
