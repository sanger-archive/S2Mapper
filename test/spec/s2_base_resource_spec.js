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

    describe("BaseResource#new()", function(){
      it("returns an unsaved BaseResource.", function(){
        expect(BaseResource.new()).toBeDefined();
      });
    });

    describe('register', function() {
      it("calls back with the resourceType", function() {
        var resource = {};
        $.extend(resource, BaseResource);
        resource.resourceType = 'foo';

        var registry = {};
        resource.register(function(name,value) { registry[name] = value; });

        expect(registry['foo']).toBe(resource);
      });
    });
  });
});
