define([
  'mapper/s2_base_resource',
  'mapper/s2_labeling_module',
  'mapper/s2_batchable_module'
], function(BaseResource, LabelingModule, BatchableModule){
  'use strict';

  var Plate = BaseResource.extendAs('plate', function(plateInstance, options) {
    $.extend(plateInstance, batchableMethods);
    $.extend(plateInstance, LabelingModule);
    $.extend(plateInstance, instanceMethods);
    return plateInstance;
  });

  Plate.resourceType = 'plate';

  // This makes the assumptions that plates are 96 well.  This will need to
  // change as we add support for 384 wells, etc.
  Plate.creationTemplate = {
    "number_of_rows":    8,
    "number_of_columns": 12
  };

  var batchableMethods = BatchableModule(Plate.resourceType);

  var instanceMethods = { };

  return Plate;
});

