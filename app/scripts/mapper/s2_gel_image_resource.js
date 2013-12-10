define([
  'mapper/s2_base_resource'
], function(BaseResource){
  'use strict';

  var GelImage = BaseResource.extendAs('gel_image', function(gelImageInstance, options) {
    return gelImageInstance;
  });

  GelImage.searchAddress = "qualitySearches";
  GelImage.resourceType = 'gel_image';

  GelImage.find = function(sangerUUID){
    return this.root.retrieve({uuid:sangerUUID, "resourceType":GelImage.resourceType, s2AppUrl:"lims-quality"});
  };
  
  GelImage.findByGel = function(uuid) {
    return this.root.retrieve({
      //url
    });
  };
  
  GelImage.

  return GelImage;
});

