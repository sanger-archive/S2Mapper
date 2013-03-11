define([
       'config',
       'mapper/s2_root'
], function(config, Root){
  'use strict';


  function assignResultTo(target){
    return function(source){ 
      // Assignment through side effect; simultates callback.
      results[target] = source;
    }
  }

  var s2, results;
  config.setTestJson('dna_only_extraction');

  describe("Batch Resource:-",function(){

    describe("Creating a new, unsaved, batch using s2.batches.new(),", function(){
      beforeEach(function(){
        results = {};
        config.currentStage = 'stage1';
        Root.load().done(assignResultTo('root'));
        s2 = results.root;
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
