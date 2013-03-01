define(['require'], function(require){
  'use strict';

  // BaseResource is intended to be an abstract class used by concrete
  // resource types such as tube, order and spin column.
  var BaseResource = Object.create(null);

  $.extend(BaseResource, {
    create: function(options){
      var rawJson           = options.rawJson;
      var resource          = Object.create(null);
      resource.rawJson      = rawJson;

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

      return 'TUBEPROMISE';
    },

    addActions: function (resource){
      var resourceJson    = resource.rawJson[resource.resourceType];
      // var match_uuid      = new RegExp('\\/'+resourceJson.uuid);
      var resourceActions = resourceJson.actions;

      for (var action in resourceActions) {
        // Check that resource UUID's match up
        // if (!match_uuid.exec(resourceActions[action])) throw {
        //   name:     'Resource Validaion',
        //   message:  "Resource UUIDs don't match up."
        // };

        // These function close over the resource's uuid as provided to the
        // original resorcePromise constructor.
        resource[action] = function (sendData) {
          var ResourceFactory = require('mapper/s2_resource');
          return ResourceFactory(resource.rawJson.uuid, action,  sendData);
        };
      }
    }
  });

  return BaseResource;
});
