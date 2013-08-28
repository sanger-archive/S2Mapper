define([
  "mapper/support/deferred"
], function(Deferred) {
  "use strict";

  return function () {
    return {
      batch: function(){
        // find order from tube
        // locate tube in order
        // if order.item has a batch uuid return it
        // else create new batch object
        return $.Deferred();
      },

      orders: function(){
        var thisResource      = this;
        var root = this.root;
        if (thisResource._orders) {
          return $.Deferred().resolve(thisResource._orders).promise();
        }

        var deferred = root.laboratorySearches.handling(root.orders).firstPage({
          "user":       root.user,
          "description":"search for order",
          "model":      "order",
          "criteria":   {
            "item":{
              "uuid": thisResource.uuid
            }
          }
        })
        .then(function(orders){
          thisResource._orders = orders;
          return orders;
        });

        return deferred.promise();

      },

      // TODO: Refactor code to always used paged results returned as an array.
      // Remove this method and use orders() instead.
      // Search for Order from tube uuid.
      order: function(){
        var thisResource      = this;
        var orderDeferred = $.Deferred();
        var root = this.root;

        if (thisResource._order) {
          orderDeferred.resolve(thisResource._order);
        } else {
          // assuming that there is only one order for one resource...
          // we use the "first" method, and not the "firstPage" one
          root.laboratorySearches.handling(root.orders).first({
            "user":       root.user,
            "description":"search for order",
            "model":      "order",
            "criteria":   {
              "item":{
                "uuid": thisResource.uuid
              }
            }
          })
          .fail(orderDeferred.reject)
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
