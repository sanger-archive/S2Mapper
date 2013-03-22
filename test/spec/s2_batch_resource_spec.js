define([
       'resource_test_helper',
       'config',
       'mapper/s2_root',
       'text!json/unit/root.json',
       'text!json/unit/order_without_batch.json',
       'text!json/unit/search_for_order_by_batch.json',
       'text!json/unit/batch.json'
], function(TestHelper, config, Root, rootTestJson, orderWithoutBatchJson, testDataOrder, batchJson){
  'use strict';

  TestHelper(function(results) {
    config.logToConsole = true;
    describe("Batch Resource:-",function(){



      results.lifeCycle();

      var s2;

      beforeEach(function () {
        config.setupTest(rootTestJson);
        Root.load({user:"username"}).done(results.assignTo('root'));
        s2 = results.get('root');
        config.setupTest(batchJson);
        s2.tubes.findByEan13Barcode('2345678901234').done(results.assignTo('tube1'));
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

      describe("New unsaved empty batch", function() {
        beforeEach(function() {
          results.batch = s2.batches.new();
        });

        it("is new", function() {
          expect(results.batch.isNew).toBe(true);
        });

        it("throws exception on save", function() {
          spyOn(results.batch, "update");
          expect(results.batch.save).toThrow();
        });

        it("has root element set", function() {
          expect(results.batch.root).toBeDefined();
        });
      });

      describe("New unsaved batch with one tube item", function() {

        var order = undefined;
        var mockOrderPromise;
        var tube1;
        var batch;

        beforeEach(function() {
          mockOrderPromise = $.Deferred();
          s2.tubes.findByEan13Barcode('2345678901234').done(
            function(tube) {
              console.log("done");
              console.log("tube");
              results.assignTo('tube1')}).
              fail(function() {
                console.log("failure");
              } );
          tube1 = results.get('tube1');
          tube1.order().done(function(theOrder) {
            order = theOrder;
            mockOrderPromise.resolve(order);
          });

          // We need to make sure that the order we get is always the
          // one we are spying on
          spyOn(tube1, "order").andReturn(mockOrderPromise);

          batch = s2.batches.new({
            resources : [ tube1 ]
          });

          spyOn(order, "update").andCallThrough();

        });

        it("has one item", function() {
          expect(batch.resources.length).toBe(1);
        });


        describe("saving", function() {
          var expectedBatchUuid = "47608460-68ac-0130-7ac8-282066132de2",
          expectedRole = "tube_to_be_extracted",
          savedBatch = undefined;

          beforeEach(function() {
            spyOn(s2.batches, "create").andCallThrough();
            batch.save().
              done(function(batch) {
              savedBatch = batch;
            });
          });


          it("creates a new batch", function() {
            expect(s2.batches.create).toHaveBeenCalledWith({user:"username"});
          });

          it("extracts the order from the tube", function() {
            expect(tube1.order).toHaveBeenCalled();
          });

          it("sets the uuid of the saved batch", function() {
            expect(savedBatch).toBeDefined();
            expect(savedBatch.uuid).toBe(expectedBatchUuid);
          });

          it("calls update on order", function() {

            // We can't test that the order has been updated
            // using static test json ( the request would always be
            // the same, so we'd always get the same result back )
            expect(order.update).toHaveBeenCalledWith({
              items: {
                tube_to_be_extracted: {
                  "3bcf8010-68ac-0130-9163-282066132de2" :
                    { batch_uuid : "47608460-68ac-0130-7ac8-282066132de2" }
                }
              }
            });
          });
        });
      });


      describe("New unsaved batch with two tube items", function() {

	var batch,
        orders = [],
	mockOrderPromises = [],
	tubes = [];

	beforeEach(function() {
	  var i;
	  s2.tubes.findByEan13Barcode('9876543210987').done(results.assignTo('tube2'));

	  tubes = [ results.get('tube1'), results.get('tube2') ];

	  mockOrderPromises = [ $.Deferred(), $.Deferred() ];
	  for(i = 0; i < 1; i++) {
	    tubes[i].order().done(function(order) {
	      orders[i] = order;
	      mockOrderPromises[i].resolve(order);
	    });

	  }
          spyOn(tubes[0], "order").andReturn(mockOrderPromises[0]);
          spyOn(tubes[1], "order").andReturn(mockOrderPromises[1]);
          batch = s2.batches.new({
            resources: tubes
          });

	});

	it("can find first and second tubes", function() {
          expect(results.get('tube1')).toBeDefined();
          expect(results.get('tube2')).toBeDefined();
	});

	it("has two items", function() {
	  expect(batch.resources.length).toBe(2);
	});

	describe("saving", function() {
          var expectedBatchUuid = "47608460-68ac-0130-7ac8-282066132de2",
          expectedRole = "tube_to_be_extracted",
	  savedBatch;

	  beforeEach(function() {
	    spyOn(s2.batches, "create").andCallThrough();
	    batch.save().
	      done(function(batch) {
		savedBatch = batch;
	      });
	  });

	  it("creates a new batch", function() {
	    expect(s2.batches.create).toHaveBeenCalledWith({user:"username"});
	  });

          it("extracts both orders from both tubes", function() {
            expect(tubes[0].order).toHaveBeenCalled();
            expect(tubes[1].order).toHaveBeenCalled();
          });

          it("sets the uuid of the saved batch", function() {
            expect(savedBatch).toBeDefined();
            expect(savedBatch.uuid).toBe(expectedBatchUuid);
          });

          xit("calls update on each order correctly", function() {
            expect(orders[0].update).toHaveBeenCalledWith({});
            expect(orders[1].update).toHaveBeenCalledWith({});
          });
	});

      });
    });
  });
});
