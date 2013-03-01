define(['mapper/s2_base_resource'], function(BaseResource){
  'use strict';

  var BatchResource = Object.create(BaseResource);
  BatchResource.resourceType = 'batch';

  return BatchResource;

});
