//This file is part of S2 and is distributed under the terms of GNU General Public License version 1 or later;
//Please refer to the LICENSE and README files for information on licensing and authorship of this file.
//Copyright (C) 2013 Genome Research Ltd.
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

