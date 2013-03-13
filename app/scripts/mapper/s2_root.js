define([
       'mapper/s2_ajax',
       'mapper/resources',
       'mapper/support/pluralization'
], function(S2Ajax, Resources) {
  'use strict';

  // register resources with root.
  var s2_ajax = new S2Ajax();

  var S2Root = Object.create(null);

  function resourceProcessor(rootInstance, resourceDeferred) {
    return function(response){
      var resourceType  = Object.keys(response.responseText)[0];
      var resourceClass = rootInstance[resourceType.pluralize()];
      var resource      = resourceClass.instantiate({
        root: rootInstance,
        rawJson: response.responseText
      });

      resourceDeferred.resolve(resource);
    }
  };

  var instanceMethods = {
    find: function(uuid){
      return this.retrieve({ uuid: uuid });
    },

    retrieve: function(options) {
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

  function processRootJson(response){
    var rawJson  = response.responseText;
    var rootInstance = {};

    for (var resource in rawJson){
      var resourceJson       = {};
      // wrap the json so that it looks like any other resource
      resourceJson[resource] = rawJson[resource];

      rootInstance[resource] = Resources.base.instantiate({
        root: rootInstance,
        rawJson: resourceJson
      });

      // Extend the class if it has specialisation set up above.
      $.extend(rootInstance[resource], Resources.get(resource));
    }

    return rootInstance;
  }

  var classMethods = {
    load: function(){
      var rootDeferred = $.Deferred();

      // Make a call for the S2 root...
      s2_ajax.send().done(function(response){
        var rootInstance = processRootJson(response);
        $.extend(rootInstance, instanceMethods);
        rootDeferred.resolve(rootInstance);
      });


      return rootDeferred;
    }
  };

  $.extend(S2Root, classMethods);


  return S2Root;
});
