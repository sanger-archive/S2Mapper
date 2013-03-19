define([
       'mapper/s2_base_resource'
], function(BaseResource){
  'use strict';

  var Order = BaseResource.extendAs('order');

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
      var deferredObject = $.Deferred();

      var root = this.root, order = this.order;
      this.items
          .filter(function(item) { return (item.batch !== null) && criteria(item, order); })
          .done(function(items) { deferredObject.resolve(root.batches.instantiate({root: root, rawJson: {batch: items[0].batch}}).read()); })
          .fail(deferredObject.reject);

       return deferredObject.promise();
    }
  };

  function extendItemBehaviour(order) {
    // Helper functions for dealing with the items structure
    function notFunction(x) { return typeof x !== 'function'; }

    // Ensure that the items in an order have a hook back into the order & the role
    _.chain(order.items).each(function(items, role) {
      _.each(items, function(item) { $.extend(item, { order: order, role: role }); });
    });

    // Instance methods for the items structure
    order.items = $.extend(Object.create({
      filter: function(fn) {
        var results = _.chain(this).values().flatten().filter(fn).value();

        var deferredObject = $.Deferred();
        if (results.length == 0) {
          deferredObject.reject();
        } else {
          deferredObject.resolve(results);
        }
        return deferredObject.promise();
      }
    }), order.items);
  }

  var classMethods = {
    instantiate: function(options) {
      var orderInstance = BaseResource.instantiate(options);
      extendItemBehaviour(orderInstance);
      $.extend(orderInstance, instanceMethods);
      return orderInstance;
    }
  };

  $.extend(Order, classMethods);

  return Order;
});
