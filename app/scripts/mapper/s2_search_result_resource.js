define(['mapper/s2_base_resource'], function(BaseResource){
  'use strict';
  var SearchResultResource = Object.create(BaseResource);

  var instanceMethods = {
  };

  var classMethods = {
    instantiate: function(options){
      var baseResource = BaseResource.instantiate(options);
      $.extend(baseResource, instanceMethods);
      return baseResource;
    }
  };

  $.extend(SearchResultResource, classMethods);

  return SearchResultResource;
});
