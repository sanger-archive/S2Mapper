define(['config', 'mapper/s2_root'], function(config, root) {
  'use strict';
  return {
    /*
     * A list of printers that can be used for barcode printing.  Each has a couple of methods:
     *
     * - printBarcodes: prints an array of labels, with success and failure callbacks;
     *
     * There are two attributes:
     *
     * - name: name of the printer;
     * - type: type of printer, probably irrelevant outside of the printer itself.
     */
    printers: _.map(config.printers, function(details) { return printer(details); })
  };

  function printer(details) {
    var deferred = $.Deferred();
    return _.extend({ print: firstPrint }, details);

    // On the first attempt to print to a printer we need to retrieve it before making the
    // actual call to print the labels.  However, we need to swap out the print implementation
    // for the subsequent behaviour, which goes direct to the resolved promise.
    function firstPrint() {
      var printArguments = arguments;
      this.print = subsequentPrints;
      return root.load({user:config.login}).then(function(root) {
        return root.supportSearches.handling(root.label_printers).first({
          user: root.user,
          description: "Locating printer " + details.name,
          model: "label_printer",
          criteria: { name: details.name }
        });
      }).then(function(printer) {
        deferred.resolve(printer);
        return printer;
      }).then(function(printer) {
        if (config.disablePrinting) {
          printLabelsToConsole(printArguments[0]);
          return deferred;
        } else {
          return printer.print.apply(printer, printArguments);
        }
      });
    }

    function printLabelsToConsole(labels) {
      var num=0;
      console.log("BEGIN LABELS PRINTING");
      _.each(labels, function(node) {
        return _.chain(node).pairs().each(function(list) {
          function printObj(list) {
            num += 1;          
            console.log([num, list[0], list[1].ean13]);            
          }
          if (_.isArray(list[1])) {
            _.each(list[1], function(obj) {
              printObj([obj.label_text.role, obj]);
            });
          } else {
            if (list[1].ean13) {
              printObj(list);
            }
          }
        });
      });
      console.log("END LABELS PRINTING");
    }
    
    // On subsequent prints we go directly to the promise, because we've resolved the
    // printer.
    function subsequentPrints() {
      var printArguments = arguments;
      return deferred.then(function(printer) {
        if (config.disablePrinting) {
          printLabelsToConsole(printArguments[0]);
          return deferred.promise();
        } else {
          printer.print.apply(printer, printArguments);
        }
      });
    }
  }
});
