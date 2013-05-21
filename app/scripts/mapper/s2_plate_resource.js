define([
  'mapper/s2_base_resource',
  'mapper/s2_labeling_module',
  'mapper/s2_batchable_module'
], function(BaseResource, LabelingModule, BatchableModule){
  'use strict';

  var Plate = BaseResource.extendAs('plate', function(gelInstance, options) {
    $.extend(gelInstance, instanceMethods);
    $.extend(gelInstance, LabelingModule);
    return gelInstance;
  });
  Plate.resourceType = 'plate';
  var instanceMethods = BatchableModule(Plate.resourceType);

  return Plate;
});

