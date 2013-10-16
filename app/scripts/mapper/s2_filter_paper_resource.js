define([
  "mapper/s2_base_resource",
  "mapper/s2_labeling_module",
  "mapper/s2_batchable_module"
], function(BaseResource, LabelingModule, BatchableModule){
  'use strict';

  var FilterPaper = BaseResource.extendAs("filter_paper", function(filterPaperInstance, options) {
    $.extend(filterPaperInstance, batchableMethods);
    $.extend(filterPaperInstance, LabelingModule);
    $.extend(filterPaperInstance, instanceMethods);
    return filterPaperInstance;
  });

  FilterPaper.resourceType      = "filter_paper";
  FilterPaper.transferBehaviour = "plateLike";
  FilterPaper.creationTemplate  = {
    "number_of_rows":    1,
    "number_of_columns": 2
  };

  var batchableMethods = BatchableModule(FilterPaper.resourceType);

  var instanceMethods = { };

  return FilterPaper;
});

