define(['mapper/s2_base_resource', 'mapper/s2_batch_resource'], function(BaseResource, BatchResource ){
  'use strict';

  var Tube = Object.create(BaseResource);
  Tube.resourceType = 'tube';

  var instanceMethods = {
    batch: function(){
      // find order from tube
      // locate tube in order
      // if order.item has a batch uuid return it
      // else create new batch object
      return $.Deferred();
    },

    order: function(){
      // Search for Order from tube uuid.
      // SearchResource.create({
      throw "NOT YET IMPLEMENTED";
      // });
    }
  };

  var classMethods = {
    instantiate: function(options){
      var baseResource = BaseResource.instantiate(options);
      $.extend(baseResource, instanceMethods);
      return baseResource;
    },

    findByEan13Barcode: function(){
      var tubeDeferred = $.Deferred();


      return tubeDeferred.resolve("TUBE");
    }
  };

  $.extend(Tube, classMethods);

  return Tube;
});
