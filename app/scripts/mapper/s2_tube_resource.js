define([
       'mapper/s2_base_resource',
       'mapper/s2_batch_resource',
       'mapper/s2_order_resource',
       'mapper/s2_labellable',
], function(BaseResource, BatchResource, Order, Labellable){
  'use strict';

  function processor(root, resourceTypeCollection) {
    return function(resultDeferred) {
      return function(response) {
        var json = response.responseText[resourceTypeCollection];
        var resource = root[resourceTypeCollection].instantiate({rawJson: json[0]});
        return resultDeferred.resolve(resource);
      };
    };
  }

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
      var thisTube      = this;
      var orderDeferred = $.Deferred();
      var root = this.root;

      if (thisTube._order) {
        orderDeferred.resolve(thisTube._order);
      } else {
        thisTube.root.searches.create({
          "search":{
            "description":"search for order",
            "model":      "order",
            "criteria":   {
              "item":{
                "uuid": thisTube.rawJson.tube.uuid,
                "role":"tube_to_be_extracted"
              }
            }
          }
        }).done(function(searchResult){
          searchResult.first(undefined, processor(root, 'orders'))
          .done(function(order){
            thisTube._order = order;
            orderDeferred.resolve(order);
          });
        });
      }

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
        searchResult.first(undefined, processor(root, 'tubes')).done(function(tube){
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

