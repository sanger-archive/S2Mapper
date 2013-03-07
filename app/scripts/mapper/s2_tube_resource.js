define([
       'mapper/s2_base_resource',
       'mapper/s2_batch_resource',
       'mapper/s2_order_resource'
], function(BaseResource, BatchResource, Order ){
  'use strict';

  var Tube = Object.create(BaseResource);
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
      var orderDeferred = $.Deferred();

      this.root.searches.create({
        "search":{
          "description":"search for order",
          "model":      "order",
          "criteria":   {
            "item":{
              "uuid": this.rawJson.tube.uuid,
              "role":"tube_to_be_extracted"
            }
          }
        }
      }).done(function(searchResult){
        searchResult.first(undefined, orderSearchProcessor)
          .done(function(order){ orderDeferred.resolve(order); });
      });

      return orderDeferred.promise();
    }
  };

  var orderSearchProcessor = function(resultDeferred){
    return function(response){
      var ordersJson = response.responseText.orders;

      // We _should_ only see one result per tube
      // ...have to check that...
      var order = Order.instantiate({rawJson: ordersJson[0]});

      return resultDeferred.resolve(order);
    };
  };

  var tubeSearchProcessor = function(resultDeferred){
    return function(response){
      var tubesJson = response.responseText.tubes;

      // We _should_ only see one result for an EAN13 search...
      var tube = Tube.instantiate({rawJson: tubesJson[0]});

      return resultDeferred.resolve(tube);
    };
  };

  var classMethods = {
    instantiate: function(options){
      var tubeInstance = BaseResource.instantiate(options);
      $.extend(tubeInstance, instanceMethods);
      return tubeInstance;
    },

    findByEan13Barcode: function(ean13){

      var tubesDeferred = $.Deferred();
      var root          = this.root;
      root.searches.create({
        "search":  {
          "description":  "search for barcoded tube",
          "model":        "tube",
          "criteria":     {
            "label":  {
              "position":  "barcode",
              "type":      "ean13-barcode",
              "value":     [ean13]
            }
          }
        }
      }).done(function(searchResult){
        console.log(searchResult);
        searchResult.first(undefined, tubeSearchProcessor).done(function(tube){
          tube.root = root;
          tubesDeferred.resolve(tube);
        });
      });


      return tubesDeferred.promise();
    }
  };

  $.extend(Tube, classMethods);

  return Tube;
});

