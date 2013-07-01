define([
  'mapper/s2_base_resource'
], function(BaseResource){
  'use strict';

  var Sample = BaseResource.extendAs('sample', function(sampleInstance, options) {
    return sampleInstance;
  });

  Sample.searchAddress = "managementSearches";
  Sample.resourceType = 'sample';

  return Sample;
});

