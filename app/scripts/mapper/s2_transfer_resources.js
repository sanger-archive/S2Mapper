//This file is part of S2 and is distributed under the terms of GNU General Public License version 1 or later;
//Please refer to the LICENSE and README files for information on licensing and authorship of this file.
//Copyright (C) 2013 Genome Research Ltd.
define(["mapper/s2_base_resource"], function(BaseResource) {
  "use strict";

  var transferModels = _.chain({
    "transfer_plates_to_plates": function(details) {
      return {
        amount:          details.amount,
        aliquot_type:    details.aliquot_type,
        source_uuid:     details.input.resource.uuid,
        source_location: details.source_location,
        target_uuid:     details.output.resource.uuid,
        target_location: details.target_location
      };
    },

    "transfer_tubes_to_tubes": function(details) {
      return {
        fraction:     details.fraction,
        aliquot_type: details.aliquot_type,
        source_uuid:  details.input.resource.uuid,
        target_uuid:  details.output.resource.uuid
      };
    },

    "transfer_wells_to_tubes": function(details) {
      return {
        fraction:        details.fraction,
        aliquot_type:    details.aliquot_type,
        source_uuid:     details.input.resource.uuid,
        source_location: details.input.location,
        target_uuid:     details.output.resource.uuid
      };
    },

    "transfer_multiple_filter_papers_to_tubes": function(details) {
      return {
        fraction:     details.fraction,
        aliquot_type: details.aliquot_type,
        source_uuid:  details.input.resource.uuid,
        source_location: "A1",  // Hack! This forces the location to A1
                                // Really this should be made "tube-like"
        target_uuid:  details.output.resource.uuid
      };
    }

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
});
