/*
 * Something that can have labels on it is labellable.  Require this module and extend the instance
 * with the returned object to get the appropriate functionality.
 */
define([
  'mapper/support/sequential_deferreds'
], function(SequentialDeferred) {
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
      return SequentialDeferred({
        labware: this
      }).then(function(state) {
        return state.labware.root.barcodes.create({
          labware:  state.labware.resourceType,
          contents: contentType,
          role:     intendedRole || "Stock"
        });
      }).then(function(state, barcode) {
        state.barcode = barcode;
        return barcode.label(state.labware);
      }).resolve(function(state) {
        return state;
      }).promise();
    }
  };
});
