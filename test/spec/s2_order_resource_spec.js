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

      beforeEach(function() {
        config.setupTest(rootTestJson);
        Root.load({username:"username"}).done(results.assignTo('root'));
        s2 = results.get('root');
      });

      describe("Calling order.getBatchFor(item), where item is a tube in the order,", function(){
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

      describe("items", function() {
        beforeEach(function() {
          config.setupTest(orderWithoutBatchJson);
          s2.tubes.findByEan13Barcode('2345678901234').done(results.assignTo('tube'));
          results.get('tube').order().done(results.assignTo('order'));
        });

        var unexpectedCall = function() { throw 'Not expected to be called'; };
        var expectedCall   = function() {
          results.assignTo('result')(arguments);
        };

        describe("filter", function() {
          var order, tube;

          beforeEach(function() {
            order = results.get('order');
            tube = results.get('tube');
          });

          it("calls the done case when roles found", function() {
            order.items.filter(function(item) { return true; }).done(expectedCall).fail(unexpectedCall);
            expect(results.get('result')[0].length).toBe(2);
          });

          it("calls the failure case if no roles found", function() {
            order.items.filter(function(item) { return false; }).done(unexpectedCall).fail(expectedCall);
            expect(results.get('result')[0]).toBeUndefined();
          });

          it("enables filtering of the items", function() {
            order.items.filter(function(item) { return item.uuid === tube.uuid; }).done(expectedCall).fail(unexpectedCall);

            var calledWithArguments = results.get('result')[0];
            expect(calledWithArguments.length).toBe(1);
            expect(calledWithArguments).toContain({ uuid: tube.uuid, order: order, role: 'tube_to_be_extracted', status: 'done', batch: null });
          });
        });
      });
    });
  });
});
