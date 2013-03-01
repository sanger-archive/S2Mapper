define(['mapper/s2_base_resource', 'mapper/s2_batch_resource'], function(BaseResource, BatchResource){
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
    }
  };

  $.extend(TubeResource, {
    create: function(rawJson){
      var baseResource = BaseResource.create(rawJson);
      $.extend(baseResource, instanceMethods);
      return baseResource;
    }
  });

  return TubeResource;
});
