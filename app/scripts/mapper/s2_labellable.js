/*
 * Something that can have labels on it is labellable.  Require this module and extend the instance
 * with the returned object to get the appropriate functionality.
 */
define([], function() {
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
      var labellable = this, deferred = $.Deferred();

      labellable.root.barcode.create({
        labware:  labellable.resourceType,
        contents: contentType,
        role:     intendedRole || "Stock"
      }).done(function(barcode) {
        barcode.label(labellable).done(function() {
          deferred.resolve();
        }).fail(deferred.failure);
      }).fail(deferred.failure);
      return deferred.promise();
    }
  };
});
