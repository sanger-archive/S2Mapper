define([
       'mapper/s2_base_resource',
       'mapper/s2_batch_resource',
       'mapper/s2_order_resource',
       'mapper/s2_labeling_module'
], function(BaseResource, BatchResource, Order, LabelingModule){
  'use strict';

  var Tube = BaseResource.extendAs('tube', function(tubeInstance, options) {
    $.extend(tubeInstance, instanceMethods);
    $.extend(tubeInstance, LabelingModule);
    return tubeInstance;
  });

  Tube.resourceType = 'tube';

  var instanceMethods = {
    batch: function(){
      // find order from tube
      // locate tube in order
      // if order.item has a batch uuid return it
      // else create new batch object
      return $.Deferred();
    },

    // Search for Order from tube uuid.
    order: function(){    
      var thisTube      = this;
      var orderDeferred = $.Deferred();
      var root = this.root;

      if (thisTube._order) {
        orderDeferred.resolve(thisTube._order);
      } else {
        // assuming that there is only one order for one tube...
        // we use the 'first' method, and not the 'firstPage' one
        thisTube.root.laboratorySearches.handling(root.orders).first({
          "user":       root.user,
          "description":"search for order",
          "model":      "order",
          "criteria":   {
            "item":{
              "uuid": thisTube.rawJson.tube.uuid
            }
          }
        })
            .then(function(order){
              order.root = root;
              thisTube._order = order;
              orderDeferred.resolve(order);
            });
      }

      return orderDeferred.promise();
    }
  };

  return Tube;
});

