define(['mapper/s2_tube_resource'], function(S2TubeResource){
  'use strict';

  describe("S2TubeResource",function(){

    describe("Searcing for a Resource by EAN13 barcode", function(){

      it("Takes an EAN13 barcode and returns the corresponding resource", function(){
        expect(S2TubeResource.findByEan13Barcode('2345678901234')).toBe('TUBEPROMISE');
      });

    });

  });
});
