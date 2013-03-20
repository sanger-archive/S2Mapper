define(['mapper/s2_base_resource'], function(BaseResource){
  'use strict';

  var Batch = BaseResource.extendAs('batch');

  function handleRootCreateDone(that, batch, deferred) {
    var batchUuid,
    itemUuid,
    currentItem,
    i,
    orderUpdateJson,
    orderResolvePromises = [],
    itemLookupPromises = [],
    orderUpdatePromises = [],
    itemUuids = [],
    nextItemPromise;    
    // TODO : temporary fixed
    var role = "tube_to_be_extracted";
   
    that.isNew = false;
    batchUuid = batch.rawJson && batch.rawJson.batch && batch.rawJson.batch.uuid;
    
    // To get an update order we need 3 levels of promises
    // 1st promise -> order
    // 2nd promise -> filtered items on order
    // 3rd promise -> updated order

    // We need to store all of each. 

    for(i = 0; i < that.resources.length; i++) {
      orderUpdateJson = {
	"items" : {
	}
      };
      orderUpdateJson.items[role] = [];
      currentItem = that.resources[i];
      if(currentItem) {
	itemUuid = currentItem.rawJson[currentItem.resourceType].uuid;
	orderResolvePromises.push(currentItem.order());
	itemUuids.push(itemUuid);
	};
    }
    
    for(i = 0; i < orderResolvePromises.length; i++) {
      orderResolvePromises[i].
	done(function(order) {
	  console.log("resolving order resolve promise");
	  nextItemPromise = handleItemOrderDone(order, role, itemUuids[i], batchUuid);
	  itemLookupPromises.push(nextItemPromise);
	  nextItemPromise.done(function(items) {
	    orderUpdatePromises.push(handleMatchingItemDone(order, items, role, itemUuids[i], batchUuid));
	  });
      }).
	fail(function() {
	  deferred.reject();
	});
    }

    // There is one for each item in the seed resources. We can't resolve until
    // all of these have gone. Therefore, we need to store each promise. But the inner
    // promises can't be reached until the outer ones have resolved. Therefore we have
    // to wait for all the 1st level promises, then all the 2nd level promises, 
    // then all the 3rd level promises
    $.when(orderResolvePromises).done(function() {
      $.when(itemLookupPromises).done(function() {
	$.when(orderUpdatePromises).done(function() {
	  deferred.resolve(batch);
	}).
	  fail(function() {
	    deferred.reject();
	  });
      }).
	fail(function() {
	  deferred.reject();
	});
      
    }).fail(function() {
      deferred.reject();
    });
  }

  function handleMatchingItemDone(order, items, role, itemUuid, batchUuid) {
    var updateJson = { "items" : {} },
    item,
    i;
    console.log("items");
    console.log(items);
    
    for(i = 0; i < items.length; i++) {
      console.log("would add batch to item:");
      console.log(items[i]);
      item = items[i];
      if (updateJson.items[role] === undefined) {
	updateJson.items[role] = {}
      }
      updateJson.items[role][itemUuid] = { "batch_uuid" : batchUuid };
    }
    
    console.log("would use this json to update order");
    console.log(updateJson);
    
    // TODO : do we need to get this promise to the calling funciton?
    return order.update(updateJson);
  }

  function handleItemOrderDone(order, role, itemUuid, batchUuid) {
    var matchingItems = order.items.filter(function(item) { 
      return item.uuid === itemUuid && item.status === "done";
    });

    return matchingItems;
  }

  function addBatchToItem(batch, itemInRole) {
    itemInRole.batch = { "uuid" : batch.rawJson.batch.uuid };
  }

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
      },     
    };

    Object.defineProperties(proxy, {
      orders: { get: instanceMethods.orders },
      items:  { get: instanceMethods.items  }
    });

    return proxy;
  }

  var instanceMethods = {
    save: function() {
      var i,
      that = this,
      deferred = $.Deferred();
      
	if(!this.items || this.items.length === 0) {
	  throw { type : "PersistenceError", message : "Empty batches cannot be saved" };
	}
      if(this.isNew) {
	this.root.batches.create({}).done(function(result) {
	  handleRootCreateDone(that, result, deferred);
	});	
      }
      
      return deferred.promise();
    }
  };

  var classMethods = {
    instantiate: function(opts){
      var options = opts || {};
      var batchInstance = BaseResource.instantiate.apply(this, [options]);
      $.extend(batchInstance, instanceMethods);

      batchInstance.resources = options.resources;

      if(!batchInstance.actions) {
	batchInstance.actions = {};
      }
      batchInstance.resources = options.resources;

      return extendProxy(proxyFor(batchInstance), batchInstance);
    }
  };

  $.extend(Batch, classMethods);

  return Batch;
    
});
