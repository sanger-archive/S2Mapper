define([
       'mapper/s2_ajax',
       'mapper/s2_base_resource',
       'mapper/s2_tube_resource'
], function(S2Ajax, BaseResource, Tube){
  'use strict';

  // register resources with root.
  var s2_ajax = new S2Ajax();

  var processResources = function(response){
    var rawJson  = response.responseText;
    var processedResources = {};

    for (var resource in rawJson){
      var resourceJson       = {};
      resourceJson[resource] = rawJson[resource];

      processedResources[resource] = BaseResource.instantiate({
        rawJson: resourceJson
      });
    }

    return processedResources;
  };

  var S2Root = Object.create(null);

  var instanceMethods = { };

  var classMethods = {
    load: function(){
      var rootDeferred = $.Deferred();

      // Make a call for the S2 root...
      s2_ajax.send().done(function(response){
        var rootInstance = processResources(response);

        $.extend(rootInstance, instanceMethods);

        $.extend(rootInstance.tubes, Tube)

        rootDeferred.resolve(rootInstance);
      });

      return rootDeferred;
    }
  };

  $.extend(S2Root, classMethods);


  return S2Root;
});
