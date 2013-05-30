/*
 * Something that can have labels on it is labellable.  Require this module and extend the instance
 * with the returned object to get the appropriate functionality.
 */
define([
  'mapper/support/deferred'
], function(Deferred) {
  'use strict';

  return {
    labelWith: function(labelDetails) {
      return this.root.labellables.create({
        name: this.uuid,
        type: "resource",
        labels: labelDetails
      });
    },

    attachBarcode: function(contentType, intendedRole) {
      return Deferred.sequentially(
        { labware: this },
        function(state) {
          return state.labware.root.barcodes.create({
            labware:  state.labware.resourceType,
            contents: contentType,
            role:     intendedRole || "Stock"
          });
        }, function(state, barcode) {
          state.barcode = barcode;
          return barcode.label(state.labware);
        }
      ).promise();
    },

    returnPrintDetails:function() {
      var data = {
        ean13:  this.labels['barcode'].value,
        sanger: this.labels['sanger label'].value
      };

      var label = {};
      label['template'] = this.resourceType;
      label[this.resourceType] = data;
      return label;
    }
  };
});
