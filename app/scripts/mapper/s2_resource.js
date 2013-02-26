define(['mapper/s2_plain_resource', 'mapper/s2_ajax'], function (PlainResource, S2Ajax) {
  "use strict";

  var s2_ajax = new S2Ajax();

  // Constructor function
  var ResourcePromise = function(uuid, sendAction, data){
    var resourceDeferred = $.Deferred();

    s2_ajax.send(
      sendAction || 'read',
      '/'+uuid,
      data
    ).done(function(response){
      var resource = PlainResource.create(response.responseText);
      resourceDeferred.resolve(resource);
    });

    // Calling promise makes the defferd object readonly
    return resourceDeferred.promise();
  };

  return ResourcePromise;
});

