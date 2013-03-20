define(['mapper/s2_base_resource'], function(BaseResource){
  'use strict';

  var Batch = BaseResource.extendAs('batch');

  function handleRootCreateDone(that, batch, deferred) {
    var batchUuid,
    itemUuid,
    currentItem,
    i,
    orderUpdateJson;
    // TODO : temporary fixed
    var role = "tube_to_be_extracted";
   
    that.isNew = false;
    batchUuid = batch.rawJson && batch.rawJson.batch && batch.rawJson.batch.uuid;
    
    for(i = 0; i < that.resources.length; i++) {
      orderUpdateJson = {
	"items" : {
	}
      };
      orderUpdateJson.items[role] = [];
      currentItem = that.resources[i];
      if(currentItem) {
	itemUuid = currentItem.rawJson[currentItem.resourceType].uuid;
	currentItem.order().done(function(order) {
	  handleItemOrderDone(order, role, itemUuid, batchUuid, orderUpdateJson);
	});
      }
    }
    
    deferred.resolve(batch);
  }

  function handleItemOrderDone(order, role, itemUuid, batchUuid) {
    var matchingItems = order.items.filter(function(item) { 
      return item.uuid === itemUuid && item.status === "done";
    }).
      done(function(items) {
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
	order.update(updateJson);
      });

    /*
    var itemsInRole = order.items[role],
    itemInRole,
    batchUuid = batch.rawJson && batch.rawJson.batch && batch.rawJson.batch.uuid,
    j;
    console.log("retrieved order", order);
    for(j = 0; j < itemsInRole.length; j++) {
      itemInRole = itemsInRole[j];
      if(itemInRole.uuid === itemUuid) {
	addBatchToItem(batch, itemInRole);
	orderUpdateJson.items[role].push({batch: { uuid: batchUuid } });
      }
      console.log("item in role", itemInRole);
    }
    
    order.update(orderUpdateJson);
    */
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
