//This file is part of S2 and is distributed under the terms of GNU General Public License version 1 or later;
//Please refer to the LICENSE and README files for information on licensing and authorship of this file.
//Copyright (C) 2013,2014 Genome Research Ltd.
define([
  "mapper/support/deferred"
], function(Deferred) {
  "use strict";

  return function () {
    return {
      batch: function(){
        return this.order().then(_.bind(function(order) {
          return order.batchFor(_.bind(function (item) {
            return item.uuid === this.uuid && item.status==="done";
          }, this));
        }, this));
        // find order from tube
        // locate tube in order
        // if order.item has a batch uuid return it
        // else create new batch object
      },

      // These are simple lookups that can be cached
      orders: cachingLookup('all',   'orders'),
      order:  cachingLookup('first', 'order')
    }
  };

  /*
   * This higher order function deals with searching for related order(s).  On the first call the function will do the
   * actual search and return a promise that will be fulfilled.  When it is resolved the returned function replaces
   * itself in the resource with a simple identity of the resolved promise so subsequent calls do nothing, effectively.
   */
  function cachingLookup(search, replaces) {
    return function() {
      var resource = this;
      var deferred = new $.Deferred();
      resource.root.laboratorySearches.handling(resource.root.orders)[search]({
        "user":       resource.root.user,
        "description":"search for order",
        "model":      "order",
        "criteria":   {
          "item":{
            "uuid": resource.uuid
          }
        }
      })
      .then(function(result){
        // Resolve the deferred and then cache this as the function we are.
        deferred.resolve(result);
        resource[replaces] = function() { return deferred; };
      }, function() {
        deferred.reject(null);
      });
      return deferred;
    };
  }
});
