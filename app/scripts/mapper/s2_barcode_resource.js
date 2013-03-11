define(['mapper/s2_base_resource'], function(BaseResource) {
  'use strict';

  var BarcodeResource = Object.create(BaseResource);
  BarcodeResource.resourceType = 'barcode';

  // TODO: Remove this function & it's call once raw JSON attributes are set directly on the instance
  function _removeAfterRefactor(barcodeInstance) {
    barcodeInstance.ean13  = barcodeInstance.rawJson.barcode.ean13;
    barcodeInstance.sanger = barcodeInstance.rawJson.barcode.sanger;
  }

  // Post processing of the raw JSON that will setup the correct attributes on the barcode instance.
  function setupInstanceAttributes(barcodeInstance) {
    _removeAfterRefactor(barcodeInstance);
    barcodeInstance.sangerBarcode = barcodeInstance.sanger.prefix + barcodeInstance.sanger.number + barcodeInstance.sanger.suffix;
  }

  // Class methods on the barcode resource type; mainly here for the extension of the base resource
  // instance to include the instance methods above.
  var classMethods = {
    instantiate: function(options) {
      var barcodeInstance = BaseResource.instantiate(options);
      setupInstanceAttributes(barcodeInstance);
      return barcodeInstance;
    }
  };
  $.extend(BarcodeResource, classMethods);

  return BarcodeResource;
});
