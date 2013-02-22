define(['mapper/s2_ajax'], function (S2Ajax) {
  "use strict";

  var s2_ajax = new S2Ajax();

  function addActionsTo(resource){
    var resourceJson    = resource.rawJson[resource.resourceType];
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
      resource[action] = function (sendData) {
        return new ResourcePromise(uuid, action,  data);
      };
    }
  }

  // Constructor function
  var ResourcePromise = function(uuid, sendAction, data){
    var resourceDeferred = $.Deferred();

    s2_ajax.send(
      sendAction || 'read',
      '/'+uuid,
      data
    ).done(function(response){
      var rawJson           = response.responseText;
      var resource          = Object.create(null);

      resource.rawJson      = rawJson;
      resource.resourceType = Object.keys(rawJson)[0];

      addActionsTo(resource);

      resourceDeferred.resolve(resource);
    });

    return resourceDeferred.promise();
  };

  return ResourcePromise;
});

