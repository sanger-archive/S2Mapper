define([
       'mapper/s2_base_resource',
       'mapper/s2_tube_resource',
       'mapper/s2_order_resource',
       'mapper/s2_ajax'
], function (BaseResource, TubeResource, OrderResource, S2Ajax) {
  "use strict";

  var s2ajax = new S2Ajax();

  var resourceClasses = {
    tube:   TubeResource,
    order:  OrderResource
  };

  // Constructor function
  var ResourcePromise = function(options){

    var resourceProcessor = function(response){
      var resourceType  = Object.keys(response.responseText)[0];
      var resourceClass = resourceClasses[resourceType] || BaseResource;
      var resource      = resourceClass.instantiate({
        rawJson: response.responseText
      });

      resourceDeferred.resolve(resource);
    };

    var resourceDeferred = $.Deferred();
    var url              = options.uuid? ('/'+options.uuid) : options.url;
    var ajaxProcessor    = options.resourceProcessor? options.resourceProcessor(resourceDeferred) : resourceProcessor;

    s2ajax.send(
      options.sendAction || 'read',
      url,
      options.data
    ).done(ajaxProcessor);

    // Calling promise makes the defferd object readonly
    return resourceDeferred.promise();
  };

  return ResourcePromise;
});

