define(['require'], function(require){
  'use strict';

  // BaseResource is intended to be an abstract class used by concrete
  // resource types such as tube, order and spin column.
  var BaseResource = Object.create(null);

  $.extend(BaseResource, {
    instantiate: function(options){
      var rawJson      = options.rawJson;
      var resource     = Object.create(null);
      resource.rawJson = rawJson;

      // This assumes that there is only one key and it's always the
      // resourceType.
      resource.resourceType = Object.keys(rawJson)[0];
      this.addActions(resource);

      return resource;
    },

    findByEan13Barcode: function(ean13){
      if (this.resourceType === undefined) throw {
        name:     'Unknown ResourceType',
        message:  'resourceType not set for this class'
      }

      return 'NOT_IMPLETMENTED';
    },

    addActions: function (resource){
      var resourceJson    = resource.rawJson[resource.resourceType];
      var resourceActions = resourceJson.actions;

      // N.B. Remeber to generate the new action function inside a another
      // function or else it will close over the last value of the action and
      // url of the for loop.
      for (var action in resourceActions) {
        resource[action] = (function(action, actionUrl){
          return function (sendData, resourceProcessor) {
            var ResourceFactory = require('mapper/s2_resource_factory');
            return new ResourceFactory({
              url:                actionUrl,
              sendAction:         action,
              data:               sendData,
              resourceProcessor:  resourceProcessor
            });
          };
        })(action, resourceActions[action]);
      }
    }
  });

  return BaseResource;
});
