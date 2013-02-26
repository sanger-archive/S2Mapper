define(['mapper/class'], function(Class){
  'use strict';
  var BaseResource = new Class;

  BaseResource.extend({
    create: function(rawJson){
      var resource          = new this;
      resource.rawJson      = rawJson;

      // This assumes that there is only one key and it's always the
      // resourceType.
      resource.resourceType = Object.keys(rawJson)[0];
      resource.addActionsTo();

      return resource;
    }
  });

  BaseResource.include({
    addActionsTo: function (resource){
      var resourceJson    = this.rawJson[this.resourceType];
      var match_uuid      = new RegExp('\\/'+resourceJson.uuid);
      var resourceActions = resourceJson.actions;

      for (var action in resourceActions) {
        // Check that resource UUID's match up
        if (!match_uuid.exec(resourceActions[action])) throw {
          name:     'Resource Validaion',
          message:  "Resource UUIDs don't match up."
        };

        // These function close over the resource's uuid as provided to the
        // original resorcePromise constructor.
        this[action] = function (sendData) {
          return new ResourcePromise(uuid, action,  data);
        };
      }
    }
  });

  return BaseResource;
});
