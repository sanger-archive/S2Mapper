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


    // This batch behaviour should move to a module to be shared by other item
    // type resources such as spin column and plate.
    describe("calling .getBatch() on a tube", function(){

      describe("when the resource is in a batch",function(){
        beforeEach(function(){
          new S2Resource('11111111-2222-3333-4444-555555555555').done(assignResultTo('tube'));
        });

        it("returns a batchPromise which resolves with a batch.", function(){
          expect(results.tube.getBatch().done).toBeDefined();
        });
      });

    });

  });
});
