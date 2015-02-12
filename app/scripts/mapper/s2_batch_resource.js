//This file is part of S2 and is distributed under the terms of GNU General Public License version 1 or later;
//Please refer to the LICENSE and README files for information on licensing and authorship of this file.
//Copyright (C) 2013,2014 Genome Research Ltd.
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
        return batch.root.laboratorySearches.handling(batch.root.orders).all({
          "user":       batch.root.user,
          "description":"search order by batch",
          "model":      "order",
          "criteria":   {
            "item":{ "batch":batch.uuid }
          }
        });
      },

      items: function () {
        return batch.orders.then(function (orders) {
          return _.chain(orders)
              .map(function (order) {
                return _.values(order.items);
              })
              .flatten()
              .filter(function (item) {
                if (item.batch && item.batch.uuid) { // if the batch is the full object
                  return item.batch.uuid === batch.uuid;
                } // otherwise, it is only the UUID of the batch...

                return item.batch === batch.uuid;
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

      rsc.orders().then(function (orders) {
        _.each(orders, function(order) {
          ordersHashedByUUID[order.uuid] = order;
        });
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

    getItemsGroupedByOrders:function (batch) {
      var defferedForGroupedResources = $.Deferred();
      var ordersHashedByUUID = {};

      batch.orders.then(function(orders) {
        _.each(orders, function(order) {
          _.each(order.itemsByBatch(batch), function (items) {
            _.each(items, function (item) {
              if (!ordersHashedByUUID[order.uuid]) {
                ordersHashedByUUID[order.uuid] = {order:order, items:[]};
              }
              ordersHashedByUUID[order.uuid].items.push(item);
            });
          });
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
    batchInstance.getItemsGroupedByOrders = function () {
      return instanceMethods.getItemsGroupedByOrders(batchInstance);
    };
    batchInstance.resources = options.resources;
    return extendProxy(proxyFor(batchInstance), batchInstance);
  });
});
