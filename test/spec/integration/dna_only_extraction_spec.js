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
      beforeEach(function(){
        config.setTestJson('dna_only_extraction');

        config.currentStage = 'stage1';
        results             = {};

        S2Root.create().done(assignResultTo('root'));
      });

      it("returns a search result object.", function(){
        var Searches = results.root.searches;

        Searches.create({
          "search":  {
            "description":  "search for barcoded tube",
            "model":        "tube",
            "criteria":     {
              "label":  {
                "position":  "barcode",
                "type":      "sanger-barcode",
                "value":     ["XX333333K"]
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
