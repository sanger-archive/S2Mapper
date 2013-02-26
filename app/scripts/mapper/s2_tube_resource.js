define(['mapper/class', 'mapper/s2_base_resource'], function(Class, BaseResource){
  'use strict';

  var TubeResource = new Class(BaseResource);

  TubeResource.extend({
    resourceType: 'tube',
    extended: function(){
      console.log('tube extended');
    }
  });


  return TubeResource;
});
