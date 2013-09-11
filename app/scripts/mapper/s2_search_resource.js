define([
  'mapper/s2_base_resource'
], function(BaseResource) {
  'use strict';

  var SearchResource = BaseResource.extendAs(['search', 'laboratorySearch', 'supportSearch', 'managementSearch']);

  $.extend(SearchResource, {
    labellableHandling: function(searchBody) {
      var root    = this.root;
      var search  = this;


      function handler(resultDeferred) {
        return function(response) {
          if (response.responseText.size === 0){
            return resultDeferred.reject(resultDeferred,'Barcode not found');
          }

          search
          .root
          .find(response.responseText.labellables[0].name)
          .then(resultDeferred.resolve);

          return resultDeferred;
        };
      };

      return search.create(searchBody).then(function (searchResult) {
        return searchResult.first(undefined, handler);
      });
    },

    handling: function(resultModel) {
      var root    = this.root;
      var search  = this;
      var handler = processor(resultModel);

      return {
        firstPage: searchHandler('first'),
        lastPage:  searchHandler('last'),
        first:     searchHandler('first', 0),
        last:      searchHandler('last', -1),
        all:       allHandler
      };

      function indexError(deferred, indexOnPage,nbOfResult){
        return deferred.reject('Index Error while retrieving '+indexOnPage+'th ' +
            'result from page : Only '+nbOfResult+' elements')
      }

      /*
       * Handles the search for all entries by building an array containing all of the results
       * as each of the pages is retrieved.
       */
      function allHandler(options) {
        var deferred = $.Deferred();
        processPagePromise([], search.create(options).then(function(results) {
          return results.first(undefined, handler);
        }));
        return deferred.promise();

        function processPagePromise(results, promise) {
          promise.then(_.partial(handlePageOfResults, results));
        }
        function handlePageOfResults(results, page) {
          var results = results.concat(page.entries);
          if (_.isUndefined(page.next)) {
            deferred.resolve(results);
          } else {
            processPagePromise(
              results,
              root.retrieve({
                url: page.next,
                sendAction: 'read',
                resourceProcessor: handler
              })
            );
          }
        }
      }

      function searchHandler(actionName, indexOnPage){
        var callback = !_.isUndefined(indexOnPage) ? _.partial(indexedEntry, indexOnPage) : allResults
        return function(options) {
          var deferred = $.Deferred();
          search.create(options).then(function(search) {
            return search[actionName](undefined, handler)
          }).then(
            _.partial(callback, deferred),
            _.bind(deferred.reject, deferred)
          );
          return deferred;
        };

        function indexedEntry(index, deferred, page) {
          var entryIndex = (index >= 0) ? index : index + page.entries.length;
          if ((entryIndex < 0) || (entryIndex >= page.entries.length)) {
            return indexError(deferred, index, page.entries.length);
          }
          return deferred.resolve(page.entries[entryIndex]);
        }
        function allResults(deferred, page) {
          return deferred.resolve(page.entries);
        }
      }
    }
  });

  return SearchResource;

  function processor(resultModel) {
    return function (resultDeferred) {
      return function(response) {
        if (response.responseText.size === 0){
          return resultDeferred.reject(resultDeferred, "Failed to retrieve page of results");
        }

        var entries = _.map(
          response.responseText[resultModel.resourceType.pluralize()],
          function(resourceJson) {
            var rawJson = {}; rawJson[resultModel.resourceType] = resourceJson;
            return resultModel.instantiate({rawJson: rawJson});
          }
        );

        return resultDeferred.resolve(_.extend({
          entries: entries
        }, response.responseText.actions));
      };
    }
  }
});

