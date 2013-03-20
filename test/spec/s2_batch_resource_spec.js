define([
       'resource_test_helper',
       'config',
       'mapper/s2_root',
       'text!json/unit/root.json',
       'text!json/unit/tube_by_barcode.json',
       'text!json/unit/search_for_order_by_batch.json'
], function(TestHelper, config, Root, rootTestJson, tubeByBarcodeJson, testDataOrder){
  'use strict';

  TestHelper(function(results) {
    describe("Batch Resource:-",function(){
      results.lifeCycle();

      var s2;

      beforeEach(function(){
        config.setupTest(rootTestJson);
        Root.load().done(results.assignTo('root'));
        s2 = results.get('root');
      });

      describe("Creating a new, unsaved, batch using s2.batches.new(),", function(){
        it("returns a new, unsaved batch resource.", function(){
          var batch = s2.batches.new();
          expect(batch.isNew).toBe(true);
        });

        it("can add items to the unsaved batch.", function(){
          config.setupTest(tubeByBarcodeJson);
          s2.tubes.findByEan13Barcode('2345678901234').done(results.assignTo('tube'));
          var tube = results.get('tube');

          var batch = s2.batches.new({ resources: [tube] });
          expect(batch.resources).toEqual([tube]);
        });
      });

      describe("orders", function() {
        var batch;

        beforeEach(function() {
          config.setupTest(testDataOrder);
          s2.find("47608460-68ac-0130-7ac8-282066132de2").done(results.assignTo('batch')).fail(results.unexpected);
          batch = results.get('batch');
        });

        it("yields the orders found", function() {
          batch.orders.done(results.assignTo('orders')).fail(results.unexpected);
          expect(results.get('orders').length).toBe(2);
        });
      });

      describe("items", function() {
        var batch;

        beforeEach(function() {
          config.setupTest(testDataOrder);
          s2.find("47608460-68ac-0130-7ac8-282066132de2").done(results.assignTo('batch')).fail(results.unexpected);
          batch = results.get('batch');
        });

        it("yields the items for a single order", function() {
          batch.items.done(results.assignTo('items')).fail(results.unexpected);
          expect(results.get('items').length).toBe(3);
        });

        it("yields the items for multiple orders", function() {
          batch.items.done(results.assignTo('items')).fail(results.unexpected);
          expect(results.get('items').length).toBe(3);
        });
      });
    });
  });
});
