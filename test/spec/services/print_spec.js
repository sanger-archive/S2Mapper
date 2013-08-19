define([
  'config',
  'resource_test_helper',
  'scripts/services/print',
  'text!json/unit/root.json',
  'text!json/unit/label_printing.json'
], function (config, TestHelper, PrintService, rootData, testData) {
  'use strict';

  TestHelper(function (results) {
    describe('PrintService', function () {

      describe('printers', function () {

        it('contains printers', function () {
          
          var printer = PrintService.printers[0];
          expect(printer.name).to.be.defined;
          expect(printer.type).to.be.defined;
          expect(typeof printer.print).to.equal('function');
        });

      });

      describe('single printer', function () {

        var printer;

        beforeEach(function () {
          printer = PrintService.printers[0];
          config.loadTestData(rootData);
          config.cummulativeLoadingTestDataInFirstStage(testData);
        });

        it('sends a single label to the SOAP service', function (done) {

          printer.print([
            {prefix:'P', barcode:'B', suffix:'S', name:'N', description:'D', project:'PR'}
          ], {user:"username"})
          .then(function() {
            results.expected();
            results.expectToBeCalled();
          })
          .fail(results.unexpected)
          .always(done) 

        });

        it('sends multiple labels to the SOAP service', function (done) {
          
          printer.print([
            {prefix:'P1', barcode:'B1', suffix:'S1', name:'N1', description:'D1', project:'PR1'},
            {prefix:'P2', barcode:'B2', suffix:'S2', name:'N2', description:'D2', project:'PR2'}
          ], {user:"username"})
            .then(function() {
              results.expected();
              results.expectToBeCalled();
             })
            .fail(results.unexpected)
            .always(done)
          
        });
      });
    });
  });
});