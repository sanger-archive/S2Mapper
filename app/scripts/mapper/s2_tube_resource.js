define(['mapper/s2_base_resource', 'mapper/s2_batch_resource'], function(BaseResource, BatchResource ){
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

    order: function(){
      // Search for Order from tube uuid.
      // SearchResource.create({
      throw "NOT YET IMPLEMENTED";
      // });
    }
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
      var baseResource = BaseResource.instantiate(options);
      $.extend(baseResource, instanceMethods);
      return baseResource;
    },

    findByEan13Barcode: function(ean13){
      var tubesDeferred = $.Deferred();

      this.root.searches.create({
        "search":  {
          "description":  "search for barcoded tube",
          "model":        "tube",
          "criteria":     {
            "label":  {
              "position":  "barcode",
              "type":      "ean13",
              "value":     [ean13]
            }
          }
        }
      }).done(function(searchResult){
        searchResult.first(undefined, tubeSearchProcessor).done(function(tubes){
          tubesDeferred.resolve(tubes);
        });
      });


      return tubesDeferred.promise();
    }
  };

  $.extend(Tube, classMethods);

  return Tube;
});

