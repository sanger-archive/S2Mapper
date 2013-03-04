define(['config', 'mapper/s2_root'], function(config, S2Root){
  'use strict';

  function assignResultTo(target){
    return function(source){
      // Assignment through side effect; simultates callback.
      results[target] = source;
    }
  }

  var rawJson, results ;
  xdescribe("INTEGRATION:  DNA only manual extraction:-", function(){

    describe("Searching for an input tube by it's EAN13 barcode,", function(){
      var root;
      beforeEach(function(){

        config.setTestJson('dna_only_extraction');

        config.currentStage = 'stage1';
        results             = {};

        S2Root.load().done(assignResultTo('root'));
        root = results.root;
      });

      it("returns a search result object.", function(){

        root.searches.create({
          "search":  {
            "description":  "search for barcoded tube",
            "model":        "tube",
            "criteria":     {
              "label":  {
                "position":  "barcode",
                "type":      "ean13",
                "value":     ["0123456789123"]
              }
            }
          }
        }).done(assignResultTo('searchResultForTube'));

        debugger;
        results.searchResultForTube.first();

      });


    });
  });
});
