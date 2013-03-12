define([
       'mapper/s2_base_resource'
], function(BaseResource){
  'use strict';

  var Order = Object.create(BaseResource);
  Order.resourceType = 'order';

  function toAttr(attr){ return function(element) { return element[attr]; }; }

  var instanceMethods = {

    // Returns null if searchItem is not in a batch (undefined is too vague).
    getBatchFor: function(searchItem){
      var orderItems = this.rawJson.order.items;

      var isSearchItemInRole = function(item, index){
        return (searchItem.rawJson.tube.uuid === item.uuid);
      };

      var itemInRole, rolesForSearchItem = [];

      for (var role in orderItems) {
        itemInRole =  orderItems[role].filter(isSearchItemInRole)[0];
        rolesForSearchItem.push(itemInRole);
      }

      var batchJson = _.chain(rolesForSearchItem).
        pluck('batch').
        compact().
        first().
        value();

      if (batchJson)
        return this.root.batches.instantiate({
          root: this.root,
          rawJson: {batch: batchJson}
        }).read();
      else
        return null;
    }
  };


  var classMethods = {
    instantiate: function(options){
      var orderInstance = BaseResource.instantiate(options);

      $.extend(orderInstance, instanceMethods);

      return orderInstance;
    }
  };

  $.extend(Order, classMethods);

  return Order;
});
