// Returns a promise that provides a tube
define(['mapper/s2_ajax'], function(S2Ajax){
  'use strict';
  var s2_ajax = new S2Ajax();

  return function(uuid){
    var tubeDeferred = $.Deferred();

    s2_ajax.send('read', '/tubes/' + uuid).
      done(function(response){
      var rawJson          = response.responseText;
      var tubeResource     = Object.create(null);
      tubeResource.rawJson = rawJson;

      for (var action in rawJson.tube.actions) {
        tubeResource[action] = function (sendData) {
          s2ajax.send(action, rawJson.tube.actions[action], sendData);
        };
      }

      tubeDeferred.resolve(tubeResource);
    });

    return tubeDeferred.promise();
  };

});
