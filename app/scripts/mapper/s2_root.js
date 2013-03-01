define([
  'mapper/s2_ajax',
  'mapper/s2_base_resource',
  'mapper/s2_searches_resource'
], function(S2Ajax, BaseResource, SearchesResource){
  'use strict';

  var s2_ajax = new S2Ajax();
  var resourceClass = {
    searches: SearchesResource
  };
  var processResources = function(response){
    var rawJson  = response.responseText;
    var processedResources = {};

    for (var resource in rawJson){
      var resourceJson = {};
      resourceJson[resource] = rawJson[resource];
      var resClass = resourceClass[resource] || BaseResource;
      processedResources[resource] = resClass.create({
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
