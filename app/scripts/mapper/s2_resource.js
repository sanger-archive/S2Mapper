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

      // The resourceType is the first and only attribute of the rawJson
      resource.resourceType = Object.keys(rawJson)[0];

      // Add the JSON's actions as functions on the Resource object
      for (var action in rawJson[resource.resourceType].actions) {
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

