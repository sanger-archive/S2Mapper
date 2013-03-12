define([
       'resource_test_helper',
       'config',
       'mapper/s2_root',
       'text!json/unit/root.json',
       'text!json/unit/order_without_batch.json',
       'text!json/unit/order_with_batch.json',
], function(TestHelper, config, Root, rootTestJson, orderWithoutBatchJson, orderWithBatchJson){
  'use strict';

  var s2, results;

  TestHelper(function(results) {
    describe("Order Resource:-", function(){
      results.lifeCycle();

      describe("Calling order.getBatchFor(item), where item is a tube in the order,", function(){
        beforeEach(function() {
          config.setupTest(rootTestJson);
          Root.load().done(results.assignTo('root'));
          s2 = results.get('root');
        });

        describe("and the item IS NOT in a batch,", function(){
          beforeEach(function(){
            config.setupTest(orderWithoutBatchJson);
            s2.tubes.findByEan13Barcode('2345678901234').done(results.assignTo('tube'));
            results.get('tube').order().done(results.assignTo('order'));
          });

          it("returns null if the item is not in a batch.", function(){
            expect(results.get('order').getBatchFor(results.get('tube'))).toBe(null);
          });
        });

        describe("and the item IS in a batch,", function(){
          beforeEach(function(){
            config.setupTest(orderWithBatchJson);
            s2.tubes.findByEan13Barcode('2345678901234').done(results.assignTo('tube'));
            results.get('tube').order().done(results.assignTo('order'));
          });

          it("returns a promise that resolves to the batch object", function(){
            expect(results.get('order').getBatchFor(results.get('tube')).done).toBeDefined();
          });
        });

      });

    });
  });
});
