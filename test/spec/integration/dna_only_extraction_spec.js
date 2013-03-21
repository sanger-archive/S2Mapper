define(['config'
       ,'mapper/s2_root'
       // ,'text!json/dna_and_rna_manual_extraction_1.json'
], function(config, S2Root, integrationTestJson){
  'use strict';

  function assignResultTo(target){

    return function(source){
      // Assignment through side effect; simultates callback.
      results[target] = source;
    }
  }

  var rawRootJson, results ;

  describe("**** INTEGRATION:  DNA only manual extraction:-", function(){
    xdescribe("Extracting DNA from an input tube,", function(){
      var s2,expectedResponse, tube;

      beforeEach(function(){
        rawRootJson         = config.setupTest(integrationTestJson);
        results             = {};
        S2Root.load({user:"username"}).done(assignResultTo('root'));
      });

      it("passes all required Mapper API calls.", function(){
        expect(_.difference(Object.keys(rawRootJson), Object.keys(results.root)) ).
          toEqual([]);

        results.root.tubes.findByEan13Barcode('2345678901234').done(assignResultTo('tube'));
        expect(results.tube).toBeDefined();

        results.tube.order().done(assignResultTo('order'));
        var batchPromise = results.order.getBatchFor(results.tube)
        expect(batchPromise).toBe(null);

        results.batch = results.root.batches.new();
        expect(results.batch).toBeDefined();
        expect(results.batch.isNew).toBe(true);
      });

    });
  });

});
