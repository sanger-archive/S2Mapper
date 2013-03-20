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
    console.log("batches create result is ", batch);
    batchUuid = batch.rawJson && batch.rawJson.batch && batch.rawJson.batch.uuid;
    console.log("batch uuid ", batchUuid);
    
    for(i = 0; i < that.items.length; i++) {
      orderUpdateJson = {
	"items" : {
	}
      };
      orderUpdateJson.items[role] = [];
      currentItem = that.items[i];
      if(currentItem) {
	itemUuid = currentItem.rawJson[currentItem.resourceType].uuid;
	console.log("item uuid", itemUuid);
	currentItem.order().done(function(order) {
	  var itemsInRole = order.items[role],
	  itemInRole,
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
	  
	});
	console.log("considering item: ", currentItem);
      }
    }
    
    deferred.resolve(batch);
  }

  function addBatchToItem(batch, itemInRole) {
    console.log("adding batch to item");
    itemInRole.batch = { "uuid" : batch.rawJson.batch.uuid };
  }

  var instanceMethods = {
    items: [],
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

      batchInstance.items = options.items;

      if(!batchInstance.actions) {
	batchInstance.actions = {};
      }
      return batchInstance;
    }
  };

  $.extend(Batch, classMethods);

  return Batch;
    
});
