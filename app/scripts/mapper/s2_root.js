define([
       'mapper/s2_ajax',
       'mapper/s2_base_resource',
       'mapper/s2_root_resource'
], function(S2Ajax, BaseResource, RootResource){
  'use strict';

  var s2_ajax = new S2Ajax();

  var processResources = function(response){
    var rawJson  = response.responseText;
    var processedResources = {};

    for (var resource in rawJson){
      var resourceJson       = {};
      resourceJson[resource] = rawJson[resource];

      processedResources[resource] = BaseResource.create({
        rawJson: resourceJson
      });
    }

    return processedResources;
  };

  var S2Root = Object.create(null);

  var instanceMethods = { };

  var classMethods = {
    create: function(){
      var rootDeferred = $.Deferred();

      s2_ajax.send().done(function(response){
        rootDeferred.resolve(processResources(response));
      });

      return rootDeferred;
    }
  };

  $.extend(S2Root, classMethods);

  return S2Root;
});
