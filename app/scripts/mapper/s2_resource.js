define(['mapper/s2_tube_resource', 'mapper/s2_order_resource',  'mapper/s2_ajax'], function (TubeResource, OrderResource, S2Ajax) {
  "use strict";

  var s2_ajax = new S2Ajax();

  var resourceClass = {
    tube:   TubeResource,
    order:  OrderResource
  };

  // Constructor function
  var ResourcePromise = function(uuid, sendAction, data){
    var resourceDeferred = $.Deferred();

    console.log('action ' +(sendAction || 'read'));

    s2_ajax.send(
      sendAction || 'read',
      '/'+uuid,
      data
    ).done(function(response){
      // TODO[sd9] Not sure is this test is actually needed...
      // Check and remove.
      // if (response.responseText === undefined) return;
      var resourceType = Object.keys(response.responseText)[0];
      var resClass = resourceClass[resourceType];
      var resource = resClass.create(response.responseText);
      resourceDeferred.resolve(resource);
    });

    // Calling promise makes the defferd object readonly
    return resourceDeferred.promise();
  };

  return ResourcePromise;
});

