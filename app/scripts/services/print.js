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
      return root.load({user:"username"}).then(function(root) {
        return root.supportSearches.handling(root.label_printers).first({
          user: root.user,
          description: "Locating printer " + details.name,
          model: "label_printer",
          criteria: { name: details.name }
        })
      }).then(function(printer) {
        deferred.resolve(printer);
        return printer;
      }).then(function(printer) {
        return printer.print.apply(printer, printArguments);
      });
    };

    // On subsequent prints we go directly to the promise, because we've resolved the
    // printer.
    function subsequentPrints() {
      var printArguments = arguments;
      return deferred.then(function(printer) {
        printer.print.apply(printer, printArguments);
      });
    }
  };
});
