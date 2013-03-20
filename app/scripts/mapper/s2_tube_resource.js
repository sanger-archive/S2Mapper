define([
       'mapper/s2_base_resource',
       'mapper/s2_batch_resource',
       'mapper/s2_order_resource',
       'mapper/s2_labellable',
], function(BaseResource, BatchResource, Order, Labellable){
  'use strict';

  var Tube = BaseResource.extendAs('tube');

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

      this.root.searches.handling(this.root.orders).first({
        "description":"search for order",
        "model":      "order",
        "criteria":   {
          "item":{
            "uuid": thisTube.rawJson.tube.uuid,
            "role":"tube_to_be_extracted"
          }
        }
      }).done(function(orders) {
        var order = orders[0];
        order.root = root;
//        thisTube._order = order;
        orderDeferred.resolve(order);
      }).fail(orderDeferred.reject);
      /*}*/

      return orderDeferred.promise();
    }
  };

  var classMethods = {
    instantiate: function(options){
      var tubeInstance = BaseResource.instantiate(options);
      $.extend(tubeInstance, instanceMethods);
      $.extend(tubeInstance, Labellable);
      return tubeInstance;
    },

    findByEan13Barcode: function(ean13){
      var deferred = $.Deferred();
      this.root.searches.handling(this.root.tubes).first({
        "description":  "search for barcoded tube",
        "model":        "tube",
        "criteria":     {
          "label":  {
            "position":  "barcode",
            "type":      "ean13-barcode",
            "value":     [ean13]
          }
        }
      }).done(function(tubes) {
        if (tubes.length == 1) {
          deferred.resolve(tubes[0]);
        } else {
          deferred.reject();
        }
      }).fail(deferred.reject);
      return deferred.promise();
    }
  };

  $.extend(Tube, classMethods);

  return Tube;
});

