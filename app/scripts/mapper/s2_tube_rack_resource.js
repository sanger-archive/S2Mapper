define([
       'mapper/s2_base_resource',
       'mapper/s2_labeling_module'
], function(BaseResource, LabelingModule){
  'use strict';

  var Tube = BaseResource.extendAs('tube_rack', function(tubeRackInstance, options) {
    $.extend(tubeRackInstance, LabelingModule);
    return tubeRackInstance;
  });
  Tube.resourceType = 'tube_rack';
  return Tube;
});

