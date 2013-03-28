define([
  'mapper/s2_base_resource'
], function(BaseResource){
  'use strict';

  var Order = BaseResource.extendAs('order', function(orderInstance, options) {
    extendItemBehaviour(orderInstance);
    $.extend(orderInstance, instanceMethods);
    return orderInstance;
  });

  var instanceMethods = {
    /* DEPRECATED: Call batchFor(predicate) to find batch
     * Returns null if searchItem is not in a batch (undefined is too vague).
     */
    getBatchFor: function(searchItem){
      var result = null;
      this.batchFor(function(item) { return item.uuid === searchItem.uuid; }).done(function(batch) { result = batch; });
      return result;
    },

    /*
     * Asynchronously find the batch based on the given predicate.  The predicate takes two arguments:
     *
     * - the current item being examined;
     * - the order being checked.
     *
     * Calls the 'done' handler on the returned promise with the first batch found, and the 'fail' handler
     * should none be found.
     */
    batchFor: function(criteria) {
      var deferredObject = $.Deferred()
      var root = this.root, order = this.order,
      results = this.items
        .filter(function(item) { return (item.batch !== null) && criteria(item, order); });
      if(results.length > 0) {
        deferredObject.resolve(results);
      } else {
        deferredObject.reject(results);
      }
      return deferredObject.promise();
    }
  };

  function extendItemBehaviour(order) {
    // Helper functions for dealing with the items structure
    function notFunction(x) { return typeof x !== 'function'; }

    Object.defineProperties(order, {
      items: {
        get: function() {
          // Instance methods for the items structure
          return $.extend(Object.create({
            filter: function(fn) {
              var results = _.chain(this).values().flatten().filter(fn).value();
              return results;
            }
          }), _.chain(order.rawJson.order.items).pairs().reduce(function(items, pair) {
            items[pair[0]] = _.map(pair[1], function(item) { return $.extend({ order: order, role: pair[0] }, item); });
            return items;
          }, {}).value());
        }
      }
    });
  }

  return Order;
});
