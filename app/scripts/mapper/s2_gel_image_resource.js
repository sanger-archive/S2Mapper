define([
  'mapper/s2_base_resource'
], function(BaseResource){
  'use strict';

  var GelImage = BaseResource.extendAs('gel_image', function(sampleInstance, options) {
    return sampleInstance;
  });

  Sample.searchAddress = "qualitySearches";
  Sample.resourceType = 'gel_image';

  Sample.find = function(sangerUUID){
    return this.root.retrieve({uuid:sangerUUID, "resourceType":Sample.resourceType, s2AppUrl:"lims-quality"});
  };

  return Sample;
});

