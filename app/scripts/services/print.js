define ([], function () {
  //call services.print ('barcode', 'desc', 'name', 'prefix', 'project', 'suffix');
  services = {
    //TODO hardcoded printer and label type, also need to change readme
    printer: 'e367bc',
    labelType:2,
    print: function (barcode, desc, name, prefix, project, suffix) {
      var soap = '<?xml version = "1.0" encoding="UTF-8"?>' +
        '<env:Envelope xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:n1="urn:Barcode/Service" xmlns:env="http://schemas.xmlsoap.org/soap/envelope/">' +
        '<env:Body>' +
        '<n1:printLabels>' +
        '<printer>' + this.printer + '</printer>' +
        '<type>' + this.labelType + '</type>' +
        '<headerLabel>1</headerLabel>' +
        '<footerLabel>1</footerLabel>' +
        '<labels n2:arrayType="n1:BarcodeLabelDTO[1]" xmlns:n2="http://schemas.xmlsoap.org/soap/encoding/" xsi:type="n2:Array">' +
        '<item>' +
        '<barcode>' + barcode + '</barcode>' +
        '<desc>' + desc + '</desc>' +
        '<name>' + name + '</name>' +
        '<prefix>' + prefix + '</prefix>' +
        '<project>' + project + '</project>' +
        '<suffix>' + suffix + '</suffix>' +
        '</item>' +
        '</labels>' +
        '</n1:printLabels>' +
        '</env:Body>' +
        '</env:Envelope>',
          deferred = $.Deferred();

      $.ajax({
        url: 'http://psd-dev.internal.sanger.ac.uk:8000/printers/legacy/soap',
        data: soap,
        type: 'POST',
        contentType: 'text/xml',
        crossDomain: true,
        processData: false,
        success: function (data){
          deferred.resolve(data);
        }
      });
      return deferred.promise();
    }
  };
  return services;
});
