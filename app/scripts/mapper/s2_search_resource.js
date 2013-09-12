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

      var forwardsHandler  = paged('first', 'next');
      var backwardsHandler = paged('last', 'previous');

      return {
        paged:     forwardsHandler,
        firstPage: firstPage(forwardsHandler),
        lastPage:  firstPage(backwardsHandler),
        first:     offsetResult(forwardsHandler, function(p) { return 0; }),
        last:      offsetResult(backwardsHandler, function(p) { return p.entries.length-1; }),
        all:       allHandler(forwardsHandler),
      };

      function indexError(deferred, indexOnPage,nbOfResult){
        return deferred.reject('Index Error while retrieving '+indexOnPage+'th ' +
            'result from page : Only '+nbOfResult+' elements')
      }

      // Handles the result that returns a single entry at the given indexed offset.
      function offsetResult(walker, indexer) {
        return function(options) {
          var result = undefined;
          return walker(options, function(page) {
            result = page.entries[indexer(page)];
            return false;
          }).then(function() {
            return result;
          });
        };
      }

      // Handles a search that returns all of the entries on the "first" page
      function firstPage(walker) {
        return function(options) {
          var results = [];
          return walker(options, function(page) {
            results = page.entries;
            return false;
          }).then(function() {
            return results;
          });
        };
      }

      // Handles walking all of the pages, returning an array containing all entries.
      function allHandler(walker) {
        return function(options) {
          var results = [];
          return walker(options, function(page) {
            results = results.concat(page.entries);
          }).then(function() {
            return results;
          });
        };
      }

      /*
       * Handles each page of results, yielding the individual page to the callback function
       * passed as they are received.  If the callback returns false (explicitly) then the
       * paging will automatically break.
       */
      function paged(initial, direction) {
        return function(options, callback) {
          var deferred = $.Deferred();
          processPagePromise(search.create(options).then(function(results) {
            return results[initial](undefined, handler);
          }));
          return deferred.promise();

          function processPagePromise(promise) {
            promise.then(
              handlePageOfResults,
              _.bind(deferred.reject, deferred)
            );
          }
          function handlePageOfResults(page) {
            var rc = callback(page);
            var url = page[direction];
            if ((_.isBoolean(rc) && !rc) || _.isUndefined(url)) {
              deferred.resolve();
            } else {
              processPagePromise(
                root.retrieve({
                  url: url,
                  sendAction: 'read',
                  resourceProcessor: handler
                })
              );
            }
          }
        };
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

