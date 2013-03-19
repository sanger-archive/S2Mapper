define(['mapper/s2_base_resource'], function(BaseResource){
  'use strict';

  var Batch= Object.create(BaseResource);
  Batch.resourceType = 'batch';

  var instanceMethods = {
    items: [],
    save: function() {
      var i,
      batch_uuid,
      orderPromise,
      currentItem,
      that = this;
      if(!this.items || this.items.length === 0) {
	throw { type : "PersistenceError", message : "Empty batches cannot be saved" };
      }
      if(!this.isNew) {
	return;
      }
      this.create({"batch": {}}).done(function(result) {
	batch_uuid = result.rawJson && result.rawJson.batch && result.rawJson.batch.uuid;
	console.log("batch uuid ", batch_uuid);
	// The response has no items, so we set it
	result.items = []; 

      for(i =0; i < that.items.length; i++) {
	currentItem = that.items[i];
	// TODO configured item manipulation
	// TODO add batch uuid etc to item

//	result.items.push(currentItem);
	
	orderPromise = currentItem && currentItem.order && currentItem.order();
	if(!orderPromise) {
	  continue;
	}
	orderPromise.done(function(order) {
	  
	  order.update();
	});
      }
      });
      
    }
  };


  var classMethods = {
    instantiate: function(opts){
      var options = opts || {};
      var batchInstance = BaseResource.instantiate(options);

      $.extend(batchInstance, instanceMethods);

      batchInstance.items = options.items;

      if(!batchInstance.actions) {
	batchInstance.actions = {};
      }

      if(batchInstance.root) {
	batchInstance.actions["create"] = bathcInstance.root["create_batches"].actions["create"];
      }
      return batchInstance;
    }
  };

  $.extend(Batch, classMethods);
  return Batch;

});
