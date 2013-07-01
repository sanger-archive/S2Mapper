define([
  'mapper/s2_base_resource'
], function(BaseResource){
  'use strict';

  var Sample = BaseResource.extendAs('sample', function(sampleInstance, options) {
    return sampleInstance;
  });

  Sample.searchAddress = "managementSearches";
  Sample.resourceType = 'sample';

  Sample.find = function(sangerUUID){
    return this.root.retrieve({uuid:sangerUUID, "resourceType":Sample.resourceType, s2AppUrl:"lims-management"});
  };

  return Sample;
});

