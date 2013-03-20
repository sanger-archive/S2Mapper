/*
 * The format of the barcodes is centralised in the system, talking to a service that, given the type of labware,
 * the role of that labware, and the contents of the labware, will return a unique number, considered to be the
 * barcode.  The barcode is represented in two manners: EAN13 and a Sanger format.  The latter is encoded in the
 * former but this code makes no assumption about this.
 *
 * Once you have a barcode to label a resource with it, causing the correct labels to be attached to the resource
 * within the core of the LIMS.
 *
 * Instance methods:
 * - label(resource) - expects the resource to respond to labelWith(labels) where labels is structured:
 *    'barcode': the EAN13 barcode label
 *    'sanger label': the Sanger specified barcode label
 */
define(['mapper/s2_base_resource'], function(BaseResource) {
  'use strict';

  var BarcodeResource = BaseResource.extendAs('barcode', function(barcodeInstance, options) {
    $.extend(barcodeInstance, instanceMethods);
    setupInstanceAttributes(barcodeInstance);
    return barcodeInstance;
  });

  // Post processing of the raw JSON that will setup the correct attributes on the barcode instance.
  function setupInstanceAttributes(barcodeInstance) {
    barcodeInstance.sangerBarcode = barcodeInstance.sanger.prefix + barcodeInstance.sanger.number + barcodeInstance.sanger.suffix;
  }

  var instanceMethods = {
    // Enables someone to label a resource with the barcode in a standardised manner
    label: function(resource) {
      return resource.labelWith({
        "barcode":      { "type": "ean13-barcode",  "value": this.ean13 },
        "sanger label": { "type": "sanger-barcode", "value": this.sangerBarcode }
      });
    }
  };

  return BarcodeResource;
});
