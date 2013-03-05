define ([], function () {
  //call services.print ('barcode', 'desc', 'name', 'prefix', 'project', 'suffix');
  services = {
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
        '</env:Envelope>'
      var xhr = new XMLHttpRequest ();
      xhr.open ('POST', 'http://psd-dev.internal.sanger.ac.uk:8000/printers/legacy/soap');
      xhr.setRequestHeader ("Content-Type", "text/xml");
      xhr.onreadystatechange = function () {
        if (this.status === 200 && this.readyState === 4) {
          alert ('Printed');
        }
      };
      xhr.send (soap);
    }
  }
  return services;
});
