define([ 'mapper/s2_tube_resource', 'mapper/s2_order_resource', 'mapper/s2_ajax' ], function (TubeResource, OrderResource, S2Ajax) {
  "use strict";

  var s2_ajax = new S2Ajax();

  var resourceClass = {
    tube:   TubeResource,
    order:  OrderResource
  };

  // Constructor function
  var ResourcePromise = function(uuid, sendAction, data){
    var resourceDeferred = $.Deferred();

    s2_ajax.send(
      sendAction || 'read',
      '/' + (uuid || ''),
      data
    ).done(function(response){
      var resourceType = Object.keys(response.responseText)[0];
      var resClass = resourceClass[resourceType];
      var resource = resClass.create({
        rawJson: response.responseText
      });

      resourceDeferred.resolve(resource);
    });

    // Calling promise makes the defferd object readonly
    return resourceDeferred.promise();
  };

  return ResourcePromise;
});

