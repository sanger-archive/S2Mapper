define(['config'], function(config) {
  'use strict';
  return {
    /*
     * A list of printers that can be used for barcode printing.  Each has a couple of methods:
     *
     * - printBarcodes: prints an array of labels, with success and failure callbacks;
     * - labelFor: creates a label from prefix, barcode, suffix, name, desc, project.
     *
     * There are two attributes:
     *
     * - name: name of the printer;
     * - type: type of printer, probably irrelevant outside of the printer itself.
     */
    printers: _.map(config.printers, function(details) { return printer(details.name, details.type); })
  };

  function printer(name, labelType) {
    return {
      name: name,
      type: labelType,

      print: function(labels) {
        return config.ajax({
          url: config.printServiceUrl,
          type: 'POST',
          data: soapForPrint({ name: name, labelType: labelType }, labels),
          dataType: 'xml',
          headers: { 'Content-Type': 'text/xml' }
        });
      },

      labelFor: function(prefix, barcode, suffix, name, desc, project) {
        return {
          prefix: prefix,
          barcode: barcode,
          suffix: suffix,
          name: name,
          description: desc,
          project: project
        };
      }
    };
  };

  function soapItemForLabel(label) {
    var soap =
      '<item>' +
        '<barcode>' + label.barcode     + '</barcode>' +
        '<desc>'    + label.description + '</desc>'    +
        '<name>'    + label.name        + '</name>'    +
        '<prefix>'  + label.prefix      + '</prefix>'  +
        '<project>' + label.project     + '</project>' +
        '<suffix>'  + label.suffix      + '</suffix>'  +
      '</item>';
    return soap;
  };

  function soapForPrint(printer, labels) {
    var soap = '<?xml version = "1.0" encoding="UTF-8"?>' +
      '<env:Envelope xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:n1="urn:Barcode/Service" xmlns:env="http://schemas.xmlsoap.org/soap/envelope/">' +
        '<env:Body>' +
          '<n1:printLabels>' +
            '<printer>' + printer.name      + '</printer>' +
            '<type>'    + printer.labelType + '</type>' +
            '<headerLabel>1</headerLabel>' +
            '<footerLabel>1</footerLabel>' +
            '<labels n2:arrayType="n1:BarcodeLabelDTO[' + labels.length + ']" xmlns:n2="http://schemas.xmlsoap.org/soap/encoding/" xsi:type="n2:Array">' +
              $.map(labels, soapItemForLabel).join('') +
            '</labels>' +
          '</n1:printLabels>' +
        '</env:Body>' +
      '</env:Envelope>';
    return soap;
  }
});
