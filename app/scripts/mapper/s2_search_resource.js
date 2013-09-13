define([
  'mapper/s2_base_resource'
], function(BaseResource) {
  'use strict';

  var SearchResource = BaseResource.extendAs(['search', 'laboratorySearch', 'supportSearch', 'managementSearch']);

  $.extend(SearchResource, {
    handling: function(resultModel, handler) {
      var root    = this.root;
      var search  = this;
      var handler = handler || processor(resultModel);

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
          var deferred = $.Deferred();

          var result = undefined;
          walker(options, function(page) {
            var index = indexer(page);
            result = ((index >= 0) && (index < page.entries.length)) ? page.entries[index] : undefined;
            return false;
          }).done(function() {
            if (_.isUndefined(result)) {
              deferred.reject("Unable to find matching entry");
            } else {
              deferred.resolve(result);
            }
          });

          return deferred;
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
    }
  });

  return SearchResource;

  function processor(resultModel) {
    return function (resultDeferred) {
      return function(response) {
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

