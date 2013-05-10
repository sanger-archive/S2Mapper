/*
 * Something that can have labels on it is labellable.  Require this module and extend the instance
 * with the returned object to get the appropriate functionality.
 */
define([
  'mapper/support/deferred'
], function(Deferred) {
  'use strict';

  return function (resourceType) {
    return {
    batch: function(){
      // find order from tube
      // locate tube in order
      // if order.item has a batch uuid return it
      // else create new batch object
      return $.Deferred();
    },

    // Search for Order from tube uuid.
    order: function(){
      var thisResource      = this;
      var orderDeferred = $.Deferred();
      var root = this.root;

      if (thisResource._order) {
        orderDeferred.resolve(thisResource._order);
      } else {
        // assuming that there is only one order for one resource...
        // we use the 'first' method, and not the 'firstPage' one
        thisResource.root.laboratorySearches.handling(root.orders).first({
          "user":       root.user,
          "description":"search for order",
          "model":      "order",
          "criteria":   {
            "item":{
              "uuid": thisResource.rawJson[resourceType].uuid
            }
          }
        })
            .then(function(order){
              order.root = root;
              thisResource._order = order;
              orderDeferred.resolve(order);
            });
      }

      return orderDeferred.promise();
    }
    }
  };
});
