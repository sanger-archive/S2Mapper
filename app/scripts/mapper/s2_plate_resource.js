//This file is part of S2 and is distributed under the terms of GNU General Public License version 1 or later;
//Please refer to the LICENSE and README files for information on licensing and authorship of this file.
//Copyright (C) 2013 Genome Research Ltd.
define([
  "mapper/s2_base_resource",
  "mapper/s2_labeling_module",
  "mapper/s2_batchable_module"
], function(BaseResource, LabelingModule, BatchableModule){
  'use strict';

  var Plate = BaseResource.extendAs("plate", function(plateInstance, options) {
    $.extend(plateInstance, batchableMethods);
    $.extend(plateInstance, LabelingModule);
    $.extend(plateInstance, instanceMethods);
    return plateInstance;
  });

  Plate.resourceType      = "plate";
  Plate.transferBehaviour = "plateLike";

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

