define(['mapper/s2_base_resource'], function(BaseResource){
  'use strict';

  var TubeResource = Object.create(BaseResource);
  TubeResource.resourceType = 'tube';

  var instanceMethods = {
    getBatch: function(){ 
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
