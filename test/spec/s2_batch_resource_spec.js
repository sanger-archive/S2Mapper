define([
       'config',
       'mapper/s2_root',
       'text!json/unit/root.json',
       'text!json/unit/tube_by_barcode.json'
], function(config, Root, rootTestJson, tubeByBarcodeJson){
  'use strict';


  function assignResultTo(target){
    return function(source){ 
      // Assignment through side effect; simultates callback.
      results[target] = source;
    }
  }

  var s2, results;

  describe("Batch Resource:-",function(){

    describe("Creating a new, unsaved, batch using s2.batches.new(),", function(){
      beforeEach(function(){
        results = {};

        config.setupTest(rootTestJson);
        Root.load().done(assignResultTo('root'));
        s2 = results.root;

        config.setupTest(tubeByBarcodeJson);
        s2.tubes.findByEan13Barcode('2345678901234').done(assignResultTo('tube'));
      });

      it("returns a new, unsaved batch resource.", function(){
        results.batch = s2.batches.new();
        expect(results.batch.isNew).toBe(true);
      });

      it("can add items to the unsaved batch.", function(){
        results.batch = s2.batches.new({
          items: [ results.tube ]
        });


        expect(results.batch.items.length).toEqual(1);
      });

    });
  });
});
