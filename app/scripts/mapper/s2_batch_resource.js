define(['mapper/s2_base_resource'], function(BaseResource){
  'use strict';

  var Batch = BaseResource.extendAs('batch');

  /*
   * We need to lazily load the 'orders' and 'items' when they are asked for, but don't want to have to
   * define these as functions.  Hence we can wrap a batch in a proxy object that deals with intercepting
   * the calls.
   *
   * TODO: Remove the proxy once the application is using functions rather than attributes.
   */
  function proxyFor(batch) {
    // Create a proxy that mimics the behaviour of the batch
    var proxy = Object.create(Object.getPrototypeOf(batch), {});
    Object.getOwnPropertyNames(batch).forEach(function(name) {
      var propertyOnBatch = Object.getOwnPropertyDescriptor(batch, name);
      Object.defineProperty(proxy, name, propertyOnBatch);
    });
    return proxy;
  }
  function extendProxy(proxy, batch) {
    // TODO: Once the proxy has been removed these are the functions that are needed on an instance
    var instanceMethods = {
      orders: function() {
        return batch.root.searches.handling(batch.root.orders).first({
          "description": "search order by batch",
          "model": "order",
          "criteria": {
            "item": { "batch": batch.uuid }
          }
        });
      },

      items: function() {
        return this.orders.then(function(orders) {
          return _.chain(orders)
                  .map(function(order) { return _.values(order.items); })
                  .flatten()
                  .filter(function(item) { return item.batch.uuid === batch.uuid; })
                  .value();
        });
      }
    };

    Object.defineProperties(proxy, {
      orders: { get: instanceMethods.orders },
      items:  { get: instanceMethods.items  }
    });
    return proxy;
  }

  var classMethods = {
    instantiate: function(opts){
      var options = opts || {};
      var batchInstance = BaseResource.instantiate(options);

      batchInstance.resources = options.resources;

      return extendProxy(proxyFor(batchInstance), batchInstance);
    }
  };

  $.extend(Batch, classMethods);
  return Batch;

});
