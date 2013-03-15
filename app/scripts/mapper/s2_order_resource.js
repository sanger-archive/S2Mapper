define([
       'mapper/s2_base_resource'
], function(BaseResource){
  'use strict';

  var Order = Object.create(BaseResource);
  Order.resourceType = 'order';

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

  // Helper functions for dealing with the items structure
  function isFunction(x) { return typeof x === 'function'; }
  function fillInRole(role, items) { return _.map(items, function(item) { return $.extend({role:role}, item); }); }

  // Instance methods for the items structure
  var itemsInstanceMethods = {
    filter: function(fn) {
      var results =
        _.chain(this)
         .map(function(items, role) { return !isFunction(items) && fillInRole(role, items) })
         .flatten()
         .compact()
         .filter(function(item) { return fn(item); })
         .value();

       var deferredObject = $.Deferred();
       if (results.length == 0) {
         deferredObject.reject();
       } else {
         deferredObject.resolve(results);
       }
       return deferredObject.promise();
    }
  };

  function initializeInstance(order) {
    $.extend(order.items, itemsInstanceMethods);
  }

  var classMethods = {
    instantiate: function(options){
      var orderInstance = BaseResource.instantiate(options);
      initializeInstance(orderInstance);
      $.extend(orderInstance, instanceMethods);

      return orderInstance;
    }
  };

  $.extend(Order, classMethods);

  return Order;
});
