//This file is part of S2 and is distributed under the terms of GNU General Public License version 1 or later;
//Please refer to the LICENSE and README files for information on licensing and authorship of this file.
//Copyright (C) 2013 Genome Research Ltd.
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

    labelRole: function() {
      var contentsLabel = this.aliquots && this.aliquots[0] && this.aliquots.type;
      return contentsLabel || '';
    },

    returnPrintDetails:function() {
      var label = {
        template: this.resourceType
      };

      label[this.resourceType] = {
        ean13:      this.labels['barcode'].value,
        sanger:     this.labels['sanger label'].value,
        label_text: {
          role: this.labelRole()
        }
      };

      return label;
    }

  };
});
