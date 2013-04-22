define([
  'mapper/s2_base_resource'
], function(BaseResource){
  'use strict';

  var Labellable = BaseResource.extendAs('labellable', function(labellableInstance, options) {
    $.extend(labellableInstance, instanceMethods);
    return labellableInstance;
  });

  function processor(root, resourceTypeCollection, resourceType) {

    return function(resultDeferred) {
      return function(response) {
        if (response.responseText.size === 0){
          // reject with error...
          return resultDeferred.reject(resultDeferred,'Barcode not found');
        }

        var json = response.responseText[resourceTypeCollection];
        var rawJson = {}; rawJson[resourceType] = json[0];

        var resource = root[resourceTypeCollection].instantiate({rawJson: rawJson});
        return resultDeferred.resolve(resource);
      };
    };
  }
  Labellable.resourceType = 'labellable';

  var instanceMethods = {
  };

  var classMethods = {
    findByEan13Barcode: function(ean13){
      var root          = this.root;
      return root.searches.create({
        "user": root.user,
        "description":  "search for a labellable",
        "model":        "labellable",
        "criteria":     {
          "label":  {
            "position":  "barcode",
            "type":      "ean13-barcode",
            "value":     ean13
          }
        }})
          .then(function(searchResult){
            return searchResult.first(undefined, processor(root, 'labellables', 'labellable'));
          })
          .then(function(tube){
              tube.root = root;
          });
    }

  };

  $.extend(Labellable, classMethods);

  return Labellable;
});

