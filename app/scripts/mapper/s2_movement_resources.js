//This file is part of S2 and is distributed under the terms of GNU General Public License version 1 or later;
//Please refer to the LICENSE and README files for information on licensing and authorship of this file.
//Copyright (C) 2013 Genome Research Ltd.
define(['mapper/s2_base_resource'], function(BaseResource) {
  'use strict';

  var movementModels = _.chain({
    'tube_rack_move': function(details) {
      return {
        source_uuid:     details.input.resource.uuid,
        source_location: details.input.location,
        target_uuid:     details.output.resource.uuid,
        target_location: details.output.location
      };
    }
  }).pairs().map(function(pair) {
    return $.extend(BaseResource.extendAs(pair[0], function(movementInstance, options) {
      return movementInstance;
    }), {
      extract: function(movements) {
        return { moves: _.map(movements, pair[1]) };
      }
    });

  });

  return {
    register: function(register) {
      movementModels.each(function(model) {
        model.register(register);
      });
    }
  };
});
