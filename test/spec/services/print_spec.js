define([
  'config',
  'resource_test_helper',
  'scripts/services/print',
  'text!json/unit/label_printing.json'
], function(config, TestHelper, PrintService, testData) {
  'use strict';

  TestHelper(function(results) {
    describe('PrintService', function() {
      describe('printers', function() {
        it('contains printers', function() {
          var printer = PrintService.printers[0];
          expect(printer.name).toBeDefined();
          expect(printer.type).toBeDefined();
          expect(typeof printer.print).toBe('function');
          expect(typeof printer.labelFor).toBe('function');
        });
      });

      describe('single printer', function() {
        results.lifeCycle();

        var printer;

        beforeEach(function() {
          printer = PrintService.printers[0];
        });

        it('sends a single label to the SOAP service', function() {
          config.setupTest(testData);
          printer.print([
            {prefix:'P',barcode:'B',suffix:'S',name:'N',description:'D',project:'PR'}
          ]).done(results.expected).fail(results.unexpected);
          results.expectToBeCalled();
        });

        it('sends multiple labels to the SOAP service', function() {
          config.setupTest(testData);
          printer.print([
            {prefix:'P1',barcode:'B1',suffix:'S1',name:'N1',description:'D1',project:'PR1'},
            {prefix:'P2',barcode:'B2',suffix:'S2',name:'N2',description:'D2',project:'PR2'}
          ]).done(results.expected).fail(results.unexpected);
          results.expectToBeCalled();
        });
      });
    });
  });
});
