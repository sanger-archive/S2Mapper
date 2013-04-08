define(['mapper/s2_base_resource'], function (BaseResource) {
  'use strict';

  /*
   * We need to lazily load the 'orders' and 'items' when they are asked for, but don't want to have to
   * define these as functions.  Hence we can wrap a batch in a proxy object that deals with intercepting
   * the calls.
   *
   * TODO: Remove the proxy once the application is using functions rather than attributes.
   */
  function proxyFor(batch) {
    // Create a proxy that mimics the behaviour of the batch
//    var proxy = Object.create(Object.getPrototypeOf(batch), {});
    var proxy = batch;
    Object.getOwnPropertyNames(batch).forEach(function (name) {
      var propertyOnBatch = Object.getOwnPropertyDescriptor(batch, name);
      Object.defineProperty(proxy, name, propertyOnBatch);
    });
    return proxy;
  }

  function extendProxy(proxy, batch) {
    // TODO: Once the proxy has been removed these are the functions that are needed on an instance
    var instanceMethods = {
      orders:function () {
        return batch.root.searches.handling(batch.root.orders).first({
          "user":       batch.root.user,
          "description":"search order by batch",
          "model":      "order",
          "criteria":   {
            "item":{ "batch":batch.uuid }
          }
        });
      },

      items:function () {
        return batch.orders.then(function (orders) {
          return _.chain(orders)
              .map(function (order) {
                return _.values(order.items);
              })
              .flatten()
              .filter(function (item) {
                return item.batch && (item.batch.uuid === batch.uuid);
              })
              .value();
        });
      }
    };

    Object.defineProperties(proxy, {
      orders:{ get:instanceMethods.orders },
      items: { get:instanceMethods.items  }
    });

    return proxy;
  }

  function updateItemsInOrdersAfterBatchCreation(seedBatch, createdBatch, deferred) {
    var orderUpdatePromises = [],
        resources;

    seedBatch.isNew = false;

    resources = seedBatch.resources.filter(function (resource) {
      return resource !== undefined;
    });

    var ordersHashedByUUID = {};
    var resourceUUIDs = [];
    var listOfPromisesForOrders = [];

    // search for the *unique* orders related to the batch
    resources.map(function (rsc) {
      resourceUUIDs.push(rsc.uuid);
      var promise = $.Deferred();
      listOfPromisesForOrders.push(promise);
      rsc.order().then(function (order) {
            ordersHashedByUUID[order.uuid] = order;
            promise.resolve();
          }
      ).fail(function () {
            promise.reject();
            deferred.reject();
          });
    });

    // when all found
    $.when.apply(null, listOfPromisesForOrders).then(function () {
      var orders = _.values(ordersHashedByUUID);

      // for each unique order
      orderUpdatePromises = orders.map(function (order) {
        // update items
        return order.setBatchForResources(createdBatch, resourceUUIDs, "done");
      });

      // then, when all updated...
      $.when.apply(null, orderUpdatePromises)
          .done(function () {
            deferred.resolve(createdBatch)
          }).fail(function () {
            deferred.reject();
          });
    }).fail(function () {
          deferred.reject();
        });
  }

  var instanceMethods = {
    save:function (unsavedBatch) {
      var deferred = $.Deferred();
      if (!unsavedBatch.resources || unsavedBatch.resources.length === 0) {
        throw { type:"PersistenceError", message:"Empty batches cannot be saved" };
      }

      if (unsavedBatch.isNew) {
        unsavedBatch.root.batches.create({user:unsavedBatch.root.user}).done(function (persistingBatch) {
          updateItemsInOrdersAfterBatchCreation(unsavedBatch, persistingBatch, deferred);
        });
      }

      return deferred.promise();
    },

    getResourcesGroupedByOrders:function (batch) {
      var defferedForGroupedResources = $.Deferred();
      var ordersHashedByUUID = {};



      batch.items.then(function (items) {
        _.each(items, function (rsc) {
          //resourceUUIDs.push(rsc.uuid); // saving the rscs' uuids
          if (!ordersHashedByUUID[rsc.order.uuid]) {
            ordersHashedByUUID[rsc.order.uuid] = {order:rsc.order, items:[]};
          }
          ordersHashedByUUID[rsc.order.uuid].items.push(rsc);
        });
        defferedForGroupedResources.resolve(ordersHashedByUUID);
      });

      return defferedForGroupedResources.promise();
    }
  };

  return BaseResource.extendAs('batch', function (batchInstance, options) {
    batchInstance.save = function () {
      return instanceMethods.save(batchInstance);
    };
    batchInstance.getResourcesGroupedByOrders = function () {
      return instanceMethods.getResourcesGroupedByOrders(batchInstance);
    };
    batchInstance.resources = options.resources;
    return extendProxy(proxyFor(batchInstance), batchInstance);
  });
});
