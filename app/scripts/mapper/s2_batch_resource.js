define(['mapper/s2_base_resource'], function(BaseResource){
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
          "user": batch.root.user,
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

  function handleBatchCreate(seedBatch, createdBatch, deferred) {
    var batchUuid,
    orderUpdatePromises = [],
    items;
    seedBatch.isNew = false;
    batchUuid = createdBatch.rawJson && createdBatch.rawJson.batch && createdBatch.rawJson.batch.uuid;

    // To get an update order we need to chain 3 promises:
    // 1st promise -> order
    // 2nd promise -> filtered items on order
    // 3rd promise -> updated order

    // We then need to store the overall promise in an array

    // We need to store all of each.

    items = seedBatch.resources.filter(
      function(item) {
	return item !== undefined;
      }).map(
      function(item) {
	return { item: item,
		 order: null,
		 uuid : null };
      });

    orderUpdatePromises = items.map(
      function(itemData) {
	return itemData.item.order().then(function(order) {
	  itemData.order = order;
	  itemData.uuid = itemData.item.rawJson[itemData.item.resourceType].uuid;
	  return handleItemOrderRetrieved(itemData.order, itemData.uuid);
	}).then(function(items) {
	  return handleItemMatchingFilter(itemData.order, items, itemData.uuid, batchUuid);
	});
      });

    // Now run when on all of the atomized promises

    $.when(orderUpdatePromises).
      done(function() {
	deferred.resolve(createdBatch) }).
      fail(function() { deferred.reject });
  }

  function handleItemMatchingFilter(order, items, itemUuid, batchUuid) {
    var
    item,
    i,
    role,
    updateJson = { "items" : {} };

    for(i = 0; i < items.length; i++) {
      item = items[i];
      role = item.role;
      if (updateJson.items[role] === undefined) {
        updateJson.items[role] = {}
      }
      updateJson.items[role][itemUuid] = { "batch_uuid" : batchUuid };
    }

    var result = order.update(updateJson);
    return result;
    return order.update(updateJson);
  }

  function handleItemOrderRetrieved(order, itemUuid) {
    return order.items.filter(function(item) {
      return item.uuid === itemUuid && item.status === "done";
    });
  }
  var instanceMethods = {
    save: function() {
      var i,
      batchInstance = this,
      deferred = $.Deferred();

      if(!this.items || this.items.length === 0) {
        throw { type : "PersistenceError", message : "Empty batches cannot be saved" };
      }
      if(this.isNew) {
        this.root.batches.create({}).done(function(result) {
          handleBatchCreate(batchInstance, result, deferred);
        });
      }

      return deferred.promise();
    }
  };

  var Batch = BaseResource.extendAs('batch', function(batchInstance, options) {
    $.extend(batchInstance, instanceMethods);
    batchInstance.resources = options.resources;
    return extendProxy(proxyFor(batchInstance), batchInstance);
  });
  return Batch;
});
