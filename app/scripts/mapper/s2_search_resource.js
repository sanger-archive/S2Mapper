define([
  'mapper/s2_base_resource'
], function(BaseResource) {
  'use strict';

  var SearchResource = BaseResource.extendAs('search');

  function processor(resultModel) {
    return function(resultDeferred) {
      return function(response) {
        if (response.responseText.size === 0){
          // reject with error...
          return resultDeferred.reject(resultDeferred,'Barcode not found');
        }

        return resultDeferred.resolve(_.map(
          response.responseText[resultModel.resourceType.pluralize()],
          function(resourceJson) {
            var rawJson = {}; rawJson[resultModel.resourceType] = resourceJson;
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
        firstPage: searchHandler('first'),
        lastPage:  searchHandler('last'),
        first: searchHandler('first', 0),
        last:  searchHandler('last', -1)
      };

      function indexError(deferred, indexOnPage,nbOfResult){
        return deferred.reject('Index Error while retrieving '+indexOnPage+'th ' +
            'result from page : Only '+nbOfResult+' elements')
      }

      function searchHandler(actionName, indexOnPage){
        // returns a function which will get all the results on the specified page
        // OR, if an indexOnPage is given,
        // returns the 'indexOnPage'-th resource on the specified page of result.
        // If indexOnPage is negative, the
        return function(options){
          var deferred = $.Deferred();
          root.searches.create(options)
              .then(function (searchResult) {
                return searchResult[actionName](undefined, handler);
              })
              .then(function(result){
                if (indexOnPage !== undefined) {

                  var nbOfResult = result.length;
                  if (indexOnPage <0){
                    // allowing -1 to be the last element
                    // -2, one before the last, etc.
                    indexOnPage = indexOnPage+nbOfResult;
                  }
                  if ( (indexOnPage >= nbOfResult) || (indexOnPage+nbOfResult < 0) ){
                      return indexError(deferred,indexOnPage,nbOfResult);
                  }

                  return deferred.resolve(result[indexOnPage]);
                } else {
                  return deferred.resolve(result);
                }
              })
              .fail(deferred.reject);
          return deferred;
        }
      }
    }
  });

  return SearchResource;
});
