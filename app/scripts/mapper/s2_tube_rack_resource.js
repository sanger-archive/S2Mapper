define([
       'mapper/s2_base_resource',
       'mapper/s2_labeling_module',
       'mapper/s2_batchable_module'
], function(BaseResource, LabelingModule, BatchableModule){
  'use strict';

  var TubeRack = BaseResource.extendAs('tube_rack', function(tubeRackInstance, options) {
    $.extend(tubeRackInstance, instanceMethods);
    $.extend(tubeRackInstance, batchableMethods);
    $.extend(tubeRackInstance, LabelingModule);
    return tubeRackInstance;
  });

  TubeRack.resourceType = 'tube_rack';
  var batchableMethods   = BatchableModule(TubeRack.resourceType);
  var instanceMethods = {
    labelRole: function(){
      var aliquotTypes = _.chain(this.tubes).
        values().
        pluck('aliquots').
        flatten().
        pluck('type').
        uniq().
        value();

      if (aliquotTypes.length > 1) throw "More than 1 type of aliquot found.";

      var aliquotType = aliquotTypes[0];

      switch (aliquotType){
        case "DNA": return "DNA Stock";
        case "RNA": return "RNA Stock";
        default:    return aliquotType;
      }
    }

  };

  return TubeRack;
});

