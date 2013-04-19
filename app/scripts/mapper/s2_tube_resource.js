define([
       'mapper/s2_base_resource',
       'mapper/s2_batch_resource',
       'mapper/s2_order_resource',
       'mapper/s2_labellable'
], function(BaseResource, BatchResource, Order, Labellable){
  'use strict';

  var Tube = BaseResource.extendAs('tube', function(tubeInstance, options) {
    $.extend(tubeInstance, instanceMethods);
    $.extend(tubeInstance, Labellable);
    return tubeInstance;
  });

  function processor(root, resourceTypeCollection, resourceType) {

    return function(resultDeferred) {
      return function(response) {
        if (response.responseText.size === 0){
          // reject with error...
          return resultDeferred.reject(resultDeferred,'Barcode not found');
        }

        var json = response.responseText[resourceTypeCollection];
        var rawJson = {}; rawJson[resourceType] = json[0];

        var resource = root[resourceTypeCollection].instantiate({rawJson: rawJson});
        return resultDeferred.resolve(resource);
      };
    };
  }
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
          "user":       root.user,
          "description":"search for order",
          "model":      "order",
          "criteria":   {
            "item":{
              "uuid": thisTube.rawJson.tube.uuid
            }
          }
        }).done(function(searchResult){
          searchResult.first(undefined, processor(root, 'orders', 'order'))
          .done(function(order){

            order.root = root;
            thisTube._order = order;
            orderDeferred.resolve(order);
          });
        });
      }

      return orderDeferred.promise();
    }
  };

  var classMethods = {
    findByEan13Barcode: function(ean13){
      var root          = this.root;
      return root.searches.create({
        "user": root.user,
        "description":  "search for barcoded tube",
        "model":        "tube",
        "criteria":     {
          "label":  {
            "position":  "barcode",
            "type":      "ean13-barcode",
            "value":     ean13
          }
        }
      }).then(function(searchResult){
        return searchResult.first(undefined, processor(root, 'tubes', 'tube'));
      });
    }
  };

  $.extend(Tube, classMethods);

  return Tube;
});

