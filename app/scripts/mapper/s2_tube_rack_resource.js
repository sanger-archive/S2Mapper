define([
       'mapper/s2_base_resource',
       'mapper/s2_labeling_module',
       'mapper/s2_batchable_module'
], function(BaseResource, LabelingModule, BatchableModule){
  'use strict';

  var TubeRack = BaseResource.extendAs('tube_rack', function(tubeRackInstance, options) {
    $.extend(tubeRackInstance, instanceMethods);
    $.extend(tubeRackInstance, LabelingModule);
    return tubeRackInstance;
  });
  TubeRack.resourceType = 'tube_rack';
  var instanceMethods = BatchableModule(TubeRack.resourceType);

  return TubeRack;
});

