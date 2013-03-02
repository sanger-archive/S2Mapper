define([ 'mapper/s2_tube_resource', 'mapper/s2_order_resource', 'mapper/s2_ajax' ], function (TubeResource, OrderResource, S2Ajax) {
  "use strict";

  var s2ajax = new S2Ajax();

  var resourceClass = {
    tube:   TubeResource,
    order:  OrderResource
  };

  // Constructor function
  var ResourcePromise = function(uuid, sendAction, data){

    var resourceProcessor = function(response){
      var resourceType = Object.keys(response.responseText)[0];
      var resClass     = resourceClass[resourceType];
      var resource     = resClass.create({
        rawJson: response.responseText
      });

      resourceDeferred.resolve(resource);
    };

    var resourceDeferred = $.Deferred();

    s2ajax.send(
      sendAction || 'read',
      '/' + (uuid || ''),
      data
    ).done(resourceProcessor);

    // Calling promise makes the defferd object readonly
    return resourceDeferred.promise();
  };

  return ResourcePromise;
});

