define(['mapper/s2_base_resource'], function(BaseResource){
  'use strict';

  describe('S2BaseResource', function(){
    describe("findByEan13Barcode", function(){
      var callFindByEan13Barcode = function(){
        BaseResource.findByEan13Barcode('1234567890123');
      };
      it("throws an exception if findByEan13Barcode is called on it directly", function(){
        expect(callFindByEan13Barcode).toThrow();
      });
    });

  });

});
