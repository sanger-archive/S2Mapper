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

      var isSearchItemInRoll = function(item, index){
        return (searchItem.rawJson.tube.uuid === item.uuid);
      };

      var itemInRoll, rollsForSearchItem = [];

      for (var role in orderItems) {
        itemInRoll =  orderItems[role].filter(isSearchItemInRoll)[0];
        rollsForSearchItem.push(itemInRoll);
      }

      var batchJson = _.chain(rollsForSearchItem).
        pluck('batch').
        compact().
        first().
        value();

      if (batchJson) return BaseResource.instantiate({rawJson: {batch: batchJson}}).read();
      else return null;
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
