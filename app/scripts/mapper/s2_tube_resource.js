define([
  "mapper/s2_base_resource",
  "mapper/s2_batch_resource",
  "mapper/s2_order_resource",
  "mapper/s2_labeling_module",
  "mapper/s2_batchable_module"
], function(BaseResource, BatchResource, Order, LabelingModule, BatchableModule){
  'use strict';

  var Tube = BaseResource.extendAs("tube", function(tubeInstance, options) {
    $.extend(tubeInstance, instanceMethods);
    $.extend(tubeInstance, LabelingModule);
    return tubeInstance;
  });

  Tube.resourceType      = "tube";
  Tube.transferBehaviour = "tubeLike";

  var instanceMethods = BatchableModule(Tube.resourceType);

  return Tube;
});

