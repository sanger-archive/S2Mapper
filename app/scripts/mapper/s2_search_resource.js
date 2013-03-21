define([
  'mapper/s2_base_resource'
], function(BaseResource) {
  'use strict';

  var SearchResource = BaseResource.extendAs('search');

  function processor(resultModel) {
    return function(resultDeferred) {
      return function(response) {
        return resultDeferred.resolve(_.map(
          response.responseText[resultModel.resourceType.pluralize()],
          function(resourceJson) {
            var rawJson = {}; rawJson[resultModel.resourceType] = resourceJson;
            // TODO: remove 'root' here once Ian's changes come in to fix the BaseResource reference
            return resultModel.instantiate({rawJson: rawJson});
          }
        ));
      };
    };
  }

  $.extend(SearchResource, {
    handling: function(resultModel) {
      var root    = this.root;
      var handler = processor(resultModel);

      return {
        first: searchPageHandler('first'),
        last:  searchPageHandler('last')
      };

      function searchPageHandler(actionName) {
        return function(options) {
          var deferred = $.Deferred();
          root.searches.create(options).done(function(searchResult) {
            searchResult[actionName](undefined, handler).done(deferred.resolve).fail(deferred.reject);
          }).fail(deferred.reject);
          return deferred;
        };
      }
    }
  });

  return SearchResource;
});
