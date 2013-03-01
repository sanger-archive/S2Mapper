define(['mapper/s2_base_resource', 'mapper/s2_batch_resource'], function(BaseResource, BatchResource ){
  'use strict';

  var TubeResource = Object.create(BaseResource);
  TubeResource.resourceType = 'tube';

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
      // });
    }
  };

  var classMethods = {
    create: function(options){
      var baseResource = BaseResource.create(options);
      $.extend(baseResource, instanceMethods);
      return baseResource;
    }
  };

  $.extend(TubeResource, classMethods);

  return TubeResource;
});
