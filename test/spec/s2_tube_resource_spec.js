define([
       'config',
       'mapper/s2_resource_factory',
       'mapper/s2_root'
], function(config, ResourceFactory, Root){
  'use strict';

  // We use an empty object for test results so that we can use a
  // string as a pointer to a returned value.
  var results = {};

  function assignResultTo(target){
    return function(source){ 
      // Assignment through side effect; simultates callback.
      results[target] = source;
    }
  }


  describe("Tube Resource:-",function(){
    var s2;

    describe("Searcing for a tube by EAN13 barcode,", function(){
      beforeEach(function(){
        Root.load().done(assignResultTo('root'));
        s2 = results.root;
        s2.tubes.findByEan13Barcode('2345678901234').done(assignResultTo('tube'));
      });

      it("takes an EAN13 barcode and returns the corresponding resource.", function(){
        expect(results.tube.rawJson).toBeDefined();
      });
    });

    describe("Finding an order from a tube,", function(){
      beforeEach(function(){
        results             = {};
        config.currentStage = 'stage1';

        Root.load().done(assignResultTo('root'));
        s2 = results.root;

        s2.tubes.findByEan13Barcode('2345678901234').done(assignResultTo('tube'));
      });

      it("is carried out by callind .order() on a Tube.", function(){
        expect(typeof results.tube.order).toBe('function');
      });

      it("returns an OrderResourcePromise when .order() is called on a Tube.", function(){
        expect(results.tube.order().done).toBeDefined();
      });

    });

    xdescribe("finding active orders which contain the batch", function(){
      it("returns an array of Orders when .orders() is called", function(){
      });
    });

    // This batch behaviour should move to a module to be shared by other item
    // type resources such as spin column and plate.
    xdescribe("calling .batch() on a tube,", function(){

      describe("when the tube is not in a batch", function(){
        beforeEach(function(){
          new ResourceFactory({uuid: '11111111-2222-3333-4444-555555555555' }).done(assignResultTo('tube'));
          results.tube.batch().done(assignResultTo('batch'));
        });

        it("returns a new batch resource that is not persisted against S2", function(){
          expect(results.batch.new_resource).toBe(false);
        });
      });

      describe("when the tube is in a batch,",function(){
        beforeEach(function(){
          new ResourceFactory({uuid: '11111111-2222-3333-4444-555555555555'}).done(assignResultTo('tube'));
          results.tube.batch().done(assignResultTo('batch'));
        });

        it("returns a batchPromise which resolves with a batch.", function(){
          expect(results.batch).toBeDefined();
        });

      });


    });

  });
});
