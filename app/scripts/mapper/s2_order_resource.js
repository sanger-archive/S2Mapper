define(['mapper/s2_base_resource'], function(BaseResource){
  'use strict';

  var OrderResource = Object.create(BaseResource);

  OrderResource.resourceType = 'order';

  return OrderResource;
});
