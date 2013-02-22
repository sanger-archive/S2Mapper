define(['mapper/s2_ajax'], function (S2Ajax) {
  "use strict";

  var s2_ajax = new S2Ajax();

  // Constructor function
  var ResourcePromise = function(uuid, sendAction, data){
    var resourceDeferred = $.Deferred();

    s2_ajax.send((sendAction || 'read'), '/' + uuid, data).
      done(function(response){
      var rawJson      = response.responseText;

      var resource     = Object.create(null);
      resource.rawJson = rawJson;

      // The resourceType is the first and only attribute of the
      // returned json.
      resource.resourceType = Object.keys(rawJson)[0];


      // Add the JSON's actions as functions on the Resource object.
      // These function close over the resource's uuid as provide to the
      // original resorcePromise constructor.
      var match_uuid = new RegExp('\\/'+rawJson.tube.uuid);

      for (var action in rawJson[resource.resourceType].actions) {
        // Check that resource UUID's match up
        if (!match_uuid.exec(rawJson.tube.actions[action])) throw {
          name:     'Resource Validaion',
          message:  "Resource UUIDs don't match up."
        };

        resource[action] = function (sendData) {
          return new ResourcePromise(uuid, action,  data);
        };
      }

      resourceDeferred.resolve(resource);
    });

    return resourceDeferred.promise();
  };

  return ResourcePromise;
});

