define([
       'mapper/s2_ajax',
       'mapper/resources'
], function(S2Ajax, Resources) {
  'use strict';

  // register resources with root.
  var s2_ajax = new S2Ajax();

  var processResources = function(response){
    var rawJson  = response.responseText;
    var processedResources = {};

    for (var resource in rawJson){
      var resourceJson       = {};
      // wrap the json so that it looks like any other resource
      resourceJson[resource] = rawJson[resource];

      processedResources[resource] = Resources.base.instantiate({
        rawJson: resourceJson
      });

      // Extend the class if it has specialisation set up above.
      $.extend(processedResources[resource], Resources.get(resource));
    }

    return processedResources;
  };

  var S2Root = Object.create(null);

  function resourceProcessor(rootInstance, resourceDeferred) {
    return function(response){
      var resourceType  = Object.keys(response.responseText)[0];
      var resourceClass = Resources.get(resourceType);
      var resource      = resourceClass.instantiate({
        root: rootInstance,
        rawJson: response.responseText
      });

      resourceDeferred.resolve(resource);
    }
  };

  var instanceMethods = {
    find: function(uuid){
      return this.something({ uuid: uuid });
    },

    something: function(options) {
      var resourceDeferred = $.Deferred();
      var url              = options.uuid? ('/'+options.uuid) : options.url;
      var ajaxProcessor    = options.resourceProcessor? options.resourceProcessor(resourceDeferred) : resourceProcessor(this, resourceDeferred);

      s2_ajax.send(
        options.sendAction || 'read',
        url,
        options.data || null
      ).done(ajaxProcessor);

      // Calling promise makes the defferd object readonly
      return resourceDeferred.promise();
    }
  };

  var classMethods = {
    load: function(){
      var rootDeferred = $.Deferred();

      // Make a call for the S2 root...
      s2_ajax.send().done(function(response){


        var rootInstance = processResources(response);
        $.extend(rootInstance, instanceMethods);

        for (var resource in rootInstance){
          rootInstance[resource].root = rootInstance;
        }
        $.extend(rootInstance, instanceMethods);

        rootDeferred.resolve(rootInstance);
      });


      return rootDeferred;
    }
  };

  $.extend(S2Root, classMethods);


  return S2Root;
});
