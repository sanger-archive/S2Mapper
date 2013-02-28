define(['mapper/s2_base_resource'], function(BaseResource){
  'use strict';

  var TubeResource = Object.create(BaseResource);
  TubeResource.resourceType = 'tube';

  $.extend(TubeResource, {
    getBatch: function(){}
  });

  return TubeResource;
});
