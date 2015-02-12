//This file is part of S2 and is distributed under the terms of GNU General Public License version 1 or later;
//Please refer to the LICENSE and README files for information on licensing and authorship of this file.
//Copyright (C) 2013 Genome Research Ltd.
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

