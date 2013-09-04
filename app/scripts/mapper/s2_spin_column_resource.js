define([
  "mapper/s2_base_resource",
  "mapper/s2_labeling_module",
  "mapper/s2_batchable_module"
], function(BaseResource, LabelingModule, BatchableModule) {
  "use strict";

  var SpinColumn = BaseResource.extendAs("spin_column", function(spinColumnInstance, options) {
    $.extend(spinColumnInstance, instanceMethods);
    $.extend(spinColumnInstance, LabelingModule);
    return spinColumnInstance;
  });

  SpinColumn.resourceType      = "spin_column";
  SpinColumn.transferBehaviour = "tubeLike";

  var instanceMethods = BatchableModule(SpinColumn.resourceType);
  return SpinColumn;
});
