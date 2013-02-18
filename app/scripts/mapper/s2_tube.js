// Returns a promise that provides a tube
define(['mapper/s2_ajax'], function(S2Ajax){
  'use strict';

    var s2_ajax      = new S2Ajax();
  // Constructor function
  var TubePromise = function(uuid, sendAction, data){
    var tubeDeferred = $.Deferred();

    s2_ajax.send((sendAction || 'read'), '/' + uuid, data).
      done(function(response){
      var rawJson          = response.responseText;
      var tubeResource     = Object.create(null);
      tubeResource.rawJson = rawJson;

      // The resourceType is the first and only attribute of the rawJson
      tubeResource.resourceType = Object.keys(rawJson)[0];

      for (var action in rawJson.tube.actions) {
        tubeResource[action] = function (sendData) {
          return new TubePromise(uuid, action,  data);
        };
      }

      tubeDeferred.resolve(tubeResource);
    });

    return tubeDeferred.promise();
  };

  return TubePromise;
});
