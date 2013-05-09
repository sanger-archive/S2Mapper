define([
  'mapper/s2_base_resource',
  'mapper/s2_labeling_module'
], function (BaseResource) {
  'use strict';

  var Kit = BaseResource.extendAs('kit', function(kitInstance, options) {
    $.extend(kitInstance, instanceMethods);
    return kitInstance;
  });

  Kit.resourceType = 'kit';

  Kit.findByBarcode = function(barcodetype,barcodeValue){
    var root          = this.root;
    var baseResource = this;

    var today = new Date;
    var todayFormatted = [
          ("00" + today.getDate()).slice(-2),        // for padding with zeros : 5 -> 05
          ("00" + (today.getMonth() + 1)).slice(-2), // for padding with zeros : 5 -> 05
          today.getFullYear()]
        .join('-');

    var comparison = {
      "expires" : { ">=" : todayFormatted },
      "amount" : { ">=" : 1}
    };

    // when we make a search for a kit, it is always on the supportSearches...
    return root.supportSearches.handling(baseResource).first({
      "user":         root.user,
      "description":  "search for barcoded "+baseResource.resourceType,
      "model":        baseResource.resourceType,
      "criteria":     {
        "label":  {
          "position":  "front barcode",
          "type":      barcodetype,
          "value":     barcodeValue
        },
        "comparison": comparison
      }
    });
  };
  var instanceMethods = { };
  return Kit;
});
