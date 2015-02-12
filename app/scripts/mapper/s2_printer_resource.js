//This file is part of S2 and is distributed under the terms of GNU General Public License version 1 or later;
//Please refer to the LICENSE and README files for information on licensing and authorship of this file.
//Copyright (C) 2013 Genome Research Ltd.
define([
  'mapper/s2_base_resource'
], function(BaseResource) {
  'use strict';

  var labelPrintProcessor = function(deferred) {
    return function(response) {
      deferred.resolve({});
    };
  };

  var InstanceMethods = {
    print: function(labels, context) {
      var request = {
        labels: labels,
        header_text: {
          header_text1: "Start of labels",
          header_text2: "For " + context.user + " (" + labels.length + " labels)"
        },
        footer_text: {
          footer_text1: "End of labels",
          footer_text2: "For " + context.user + " (" + labels.length + " labels)"
        }
      };
      return this.create(
        request,             // The actual print data
        labelPrintProcessor  // Custom handler
      );
    }
  };

  var Printer = BaseResource.extendAs('label_printer', function(printerInstance, options) {
    $.extend(printerInstance, InstanceMethods);
    return printerInstance;
  });

  _.extend(Printer, {
    find: function(uuid) {
      // HACK: Can't retrieve directly by UUID at the moment, but can reliably determine location from actions!
      var url = this.rawJson[this.resourceType.pluralize()].actions.read.replace(/\/[^\/]+$/, "/" + uuid);
      return this.root.retrieve({ url: url });
    }
  });

  return Printer;
});
