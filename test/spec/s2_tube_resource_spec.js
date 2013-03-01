define(['config','mapper/s2_resource', 'mapper/s2_tube_resource'], function(config,S2Resource, S2TubeResource){
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

  config.setTestJson('dna_only_extraction');

  describe("S2TubeResource",function(){

    describe("Searcing for a Resource by EAN13 barcode", function(){

      // TODO[sd9] This is stubbed out waiting pending a latter ticket.
      it("Takes an EAN13 barcode and returns the corresponding resource", function(){
        expect(S2TubeResource.findByEan13Barcode('2345678901234')).toBe('TUBEPROMISE');
      });

    });

    describe("finding active orders which contain the batch", function(){
      it("returns an array of Orders when .orders() is called")
    });

    // This batch behaviour should move to a module to be shared by other item
    // type resources such as spin column and plate.
    xdescribe("calling .batch() on a tube", function(){

      describe("when the tube is not in a batch", function(){
        beforeEach(function(){
          new S2Resource('11111111-2222-3333-4444-555555555555').done(assignResultTo('tube'));
          results.tube.batch().done(assignResultTo('batch'));
        });

        it("returns a new batch resource that is not persisted against S2", function(){
          expect(results.batch.new_resource).toBe(false);
        });
      });

      describe("when the tube is in a batch",function(){
        beforeEach(function(){
          new S2Resource('11111111-2222-3333-4444-555555555555').done(assignResultTo('tube'));
          results.tube.batch().done(assignResultTo('batch'));
        });

        it("returns a batchPromise which resolves with a batch.", function(){
          expect(results.batch).toBeDefined();
        });

      });


    });

  });
});
