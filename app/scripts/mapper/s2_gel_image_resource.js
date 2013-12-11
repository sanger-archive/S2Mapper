define([
  'mapper/s2_base_resource'
], function(BaseResource){
  'use strict';

  var GelImage = BaseResource.extendAs('gel_image', function(gelImageInstance, options) {
    $.extend(gelImageInstance, instanceMethods);
    return gelImageInstance;
  });
  

  GelImage.searchAddress = "qualitySearches";
  GelImage.resourceType = 'gel_image';
 
  GelImage.score = function(scores) {
    return this.root.retrieve({
      uuid: this.uuid,
      "resourceType": GelImage.resourceType, 
      s2AppUrl:"lims-quality",
      data: scores,
      sendAction: "update"
    });
  };
  
  var instanceMethods = { score: GelImage.score};

  return GelImage;
});

