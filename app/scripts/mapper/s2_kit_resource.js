define([
  'mapper/s2_base_resource',
  'mapper/s2_labeling_module'
], function (BaseResource) {
  'use strict';

  var Kit = Object.create(null);
  $.extend(Kit, {
    resourceType:'kit',
    register:function (callback) {
      callback(this.resourceType, this);
    },

    findByEan13Barcode:function (ean13) {
      return this.findByBarcode("ean13-barcode", ean13);
    },

    findBySangerBarcode:function (sangerBarcode) {
      return this.findByBarcode("sanger_barcode", sangerBarcode);
    },

    findByBarcode:function (barcodetype, barcodeValue) {
      var root = this.root;
      var baseResource = this;

      // when we make a search for a kit, it is always on the supportSearches...
      return root.supportSearches.handling(baseResource).first({
        "user":root.user,
        "description":"search for barcoded " + baseResource.resourceType,
        "model":baseResource.resourceType,
        "criteria":{
          "label":{
            "position":"barcode",
            "type":barcodetype,
            "value":barcodeValue
          }
        }
      });
    }

  });

//  var Kit = BaseResource.extendAs('kit', function(kitInstance, options) {
//    $.extend(kitInstance, LabelingModule, instanceMethods);
//    return kitInstance;
//  });

//  Kit.resourceType = 'kit';
//
//  var instanceMethods = {
//    register: function(callback) { callback(this.resourceType, this); },
//
//
//    findByEan13Barcode: function(ean13){
//      return this.findByBarcode("ean13-barcode",ean13);
//    },
//
//    findBySangerBarcode: function(sangerBarcode){
//      return this.findByBarcode("sanger_barcode", sangerBarcode);
//    },
//
//    findByBarcode: function(barcodetype,barcodeValue){
//      var root          = this.root;
//      var baseResource = this;
//
//      // when we make a search for a kit, it is always on the supportSearches...
//      return root.supportSearches.handling(baseResource).first({
//        "user":         root.user,
//        "description":  "search for barcoded "+baseResource.resourceType,
//        "model":        baseResource.resourceType,
//        "criteria":     {
//          "label":  {
//            "position":  "barcode",
//            "type":      barcodetype,
//            "value":     barcodeValue
//          }
//        }
//      });
//    }
//
//  };

  return Kit;
});

