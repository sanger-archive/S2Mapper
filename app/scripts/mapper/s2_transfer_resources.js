define(["mapper/s2_base_resource"], function(BaseResource) {
  "use strict";

  var transferModels = _.chain({
    // Plate-to-plate like transfers ...
    "transfer_plates_to_plates":                 plateToPlate,
    "transfer_multiple_filter_papers_to_plates": plateToPlate,

    // Tube-to-tube like transfers ...
    "transfer_tubes_to_tubes":                   tubeToTube,

    // Plate-to-tube like transfers ...
    "transfer_wells_to_tubes":                   plateToTube,
    "transfer_multiple_filter_papers_to_tubes":  plateToTube
  }).pairs().map(function(pair) {
    return $.extend(BaseResource.extendAs(pair[0], function(transferInstance) {
      return transferInstance;
    }), {
      extract: function(transfers) {
        return { transfers: _.map(transfers, pair[1]) };
      }
    });
  });

  return {
    register: function(register) {
      transferModels.each(function(model) {
        model.register(register);
      }).value();
    }
  };

  function plateToTube(details) {
    return {
      fraction:        details.fraction,
      aliquot_type:    details.aliquot_type,
      source_uuid:     details.input.resource.uuid,
      source_location: details.input.location,
      target_uuid:     details.output.resource.uuid
    };
  }

  function plateToPlate(details) {
    return {
      amount:          details.amount,
      aliquot_type:    details.aliquot_type,
      source_uuid:     details.input.resource.uuid,
      source_location: details.source_location,
      target_uuid:     details.output.resource.uuid,
      target_location: details.target_location
    };
  }

  function tubeToTube(details) {
    return {
      fraction:     details.fraction,
      aliquot_type: details.aliquot_type,
      source_uuid:  details.input.resource.uuid,
      target_uuid:  details.output.resource.uuid
    };
  }
});
