define(['mapper/s2_base_resource'], function(BaseResource){
  'use strict';

  var Batch = BaseResource.extendAs('batch');

  var instanceMethods = {
    orders: function() {
      return this.root.searches.handling(this.root.orders).first({
        "description": "search order by batch",
        "model": "order",
        "criteria": {
          "item": {
            "batch": this.uuid
          }
        }
      });
    },

    items: function() {
      var batch = this;
      return this.orders().then(function(orders) {
        return _.chain(orders)
                .map(function(order) { return _.values(order.items); })
                .flatten()
                .filter(function(item) { return item.batch.uuid === batch.uuid; })
                .value();
      });
    }
  };


  var classMethods = {
    instantiate: function(opts){
      var options = opts || {};
      var batchInstance = BaseResource.instantiate(options);

      $.extend(batchInstance, instanceMethods);
      batchInstance.resources = options.resources;

      return batchInstance;
    }
  };

  $.extend(Batch, classMethods);
  return Batch;

});
