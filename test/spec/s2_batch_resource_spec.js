define([
  'resource_test_helper',
  'config',
  'mapper/s2_root',
  'text!json/unit/batch_resource_spec_data/data_for_orders.json',
  'text!json/unit/batch_resource_spec_data/data_for_unsaved_batch_one_tube.json',
  'text!json/unit/batch_resource_spec_data/data_for_unsaved_batch_two_tubes.json',
  'text!json/unit/root.json',
  'text!json/unit/batch_resource_spec_data/order_without_batch.json',
  'text!json/unit/batch_resource_spec_data/search_for_order_by_batch.json',
  'text!json/unit/batch_resource_spec_data/batch.json'
], function (TestHelper, config, Root, dataForOrder, dataForBatchOneTube, dataForBatchTwoTubes, rootTestJson, orderWithoutBatchJson, testDataOrder, batchJson) {
  'use strict';

  TestHelper(function (results) {
    describe("Batch Resource:-", function () {

      results.lifeCycle();

      var s2;

      xdescribe("orders & items : ", function () {
        var batch;

        beforeEach(function () {
          config.setupTest(dataForOrder);
          Root.load({user:"username"}).done(results.assignTo('root'));
          s2 = results.get('root');
          //s2.tubes.findByEan13Barcode('tube1_BC').done(results.assignTo('tube1'));

          s2.find("batch_UUID").done(results.assignTo('batch')).fail(results.unexpected);
          batch = results.get('batch');
        });

        it("yields the orders found", function () {
          batch.orders.done(results.assignTo('orders')).fail(results.unexpected);
          expect(results.get('orders').length).toBe(2);
        });

        it("yields all the items in the batch, from all the orders", function () {
          batch.items.done(results.assignTo('items')).fail(results.unexpected);
          expect(results.get('items').length).toBe(3);
        });

      });

      xdescribe("New unsaved empty batch", function () {
        beforeEach(function () {
          results.batch = s2.batches.new();
        });

        it("is new", function () {
          expect(results.batch.isNew).toBe(true);
        });

        it("throws exception on save", function () {
          spyOn(results.batch, "update");
          expect(results.batch.save).toThrow();
        });

        it("has root element set", function () {
          expect(results.batch.root).toBeDefined();
        });
      });

      describe("New unsaved batch with one tube item, ", function () {

        var order = undefined;
        var mockOrderPromise;
        var tube1;
        var batch;

        beforeEach(function () {
          mockOrderPromise = $.Deferred();

          config.setupTest(dataForBatchOneTube);
          Root.load({user:"username"}).done(results.assignTo('root'));
          s2 = results.get('root');
          s2.tubes.findByEan13Barcode('tube1_BC').done(
              function (tube) {
                tube1 = tube;
              }).then(function () {
                tube1.order().done(function (theOrder) {
                  order = theOrder;
                  mockOrderPromise.resolve(order);
                })
              });

          // We need to make sure that the order we get is always the
          // one we are spying on
          spyOn(tube1, "order").andReturn(mockOrderPromise);

          batch = s2.batches.new({
            resources:[ tube1 ]
          });

          spyOn(order, "update").andCallThrough();

        });

        it("has one item", function () {
          expect(batch.resources.length).toBe(1);
        });

        describe("saving", function () {
          var expectedBatchUuid = "batch_UUID",
              expectedRole = "tube_to_be_extracted",
              savedBatch = undefined;

          beforeEach(function () {
            spyOn(s2.batches, "create").andCallThrough();
            batch.save().
                done(function (batch) {
                  savedBatch = batch;
                });
          });

          xit("creates a new batch", function () {
            expect(s2.batches.create).toHaveBeenCalledWith({user:"username"});
          });

          xit("extracts the order from the tube", function () {
            expect(tube1.order).toHaveBeenCalled();
          });

          xit("sets the uuid of the saved batch", function () {
            expect(savedBatch).toBeDefined();
            expect(savedBatch.uuid).toBe(expectedBatchUuid);
          });

          it("calls update on order", function () {

            // We can't test that the order has been updated
            // using static test json ( the request would always be
            // the same, so we'd always get the same result back )
            expect(order.update).toHaveBeenCalledWith({
              //user:"username",
              items:{
                tube_to_be_extracted:{
                  "tube1_UUID":{ batch_uuid:"batch_UUID" }
                }
              }
            });
          });
        });
      });

      describe("New unsaved batch with two tube items", function () {

        var batch,
            orders = [],
            mockOrderPromises = [],
            tubes = [];

        beforeEach(function () {

          mockOrderPromises = [ $.Deferred(), $.Deferred() ];

          config.setupTest(dataForBatchTwoTubes);
          Root.load({user:"username"}).done(results.assignTo('root'));
          s2 = results.get('root');
          s2.tubes.findByEan13Barcode('tube1_BC').done(
              function (tube) {
                tubes[0] = tube;
              }).then(function () {
                tubes[0].order().done(function (theOrder) {
                  orders[0] = theOrder;
//                  debugger;
                  spyOn(orders[0], "update").andCallThrough();

                  mockOrderPromises[0].resolve(orders[0]);
                })
              });
          s2.tubes.findByEan13Barcode('tube2_BC').done(
              function (tube) {
                tubes[1] = tube;
              }).then(function () {
                tubes[1].order().done(function (theOrder) {
                  orders[1] = theOrder;
                  spyOn(orders[1], "update").andCallThrough();
                  mockOrderPromises[1].resolve(orders[1]);
                })
              });

//
//          var i;
//          //s2.tubes.findByEan13Barcode('9876543210987').done(results.assignTo('tube2'));
//
//          tubes = [ results.get('tube1'), results.get('tube2') ];
//
//          mockOrderPromises = [ $.Deferred(), $.Deferred() ];
//
//          tubes[0].order().done(function (order) {
//            orders[0] = order;
//            mockOrderPromises[0].resolve(order);
//          })
//
//          tubes[1].order().done(function (order) {
//            orders[1] = order;
//            mockOrderPromises[1].resolve(order);
//          });

          spyOn(tubes[0], "order").andReturn(mockOrderPromises[0]);
          spyOn(tubes[1], "order").andReturn(mockOrderPromises[1]);
          batch = s2.batches.new({
            resources:tubes
          });
          debugger;

        });

        it("can find first and second tubes", function () {
          mockOrderPromises[0].then(function(){
          expect(tubes[0]).toBeDefined();
          expect(tubes[1]).toBeDefined();
          });
//          expect(results.get('tube2')).toBeDefined();
        });

        it("has two items", function () {
          expect(batch.resources.length).toBe(2);
        });

        it(", both of the same order (making sure the test data are correct)", function () {
          $.when($.apply(null,mockOrderPromises)).then(function(){
            expect(orders[0].uuid).toEqual(orders[1].uuid);
          });

        });

        describe("saving", function () {
          var expectedBatchUuid = "batch_UUID",
              savedBatch;

          beforeEach(function () {
            spyOn(s2.batches, "create").andCallThrough();

            batch.save().
                done(function (batch) {
                  savedBatch = batch;
                }).fail(function(){debugger;});
          });

          xit("creates a new batch", function () {
            expect(s2.batches.create).toHaveBeenCalledWith({user:"username"});
          });

          xit("extracts both orders from both tubes", function () {
            expect(tubes[0].order).toHaveBeenCalled();
//            expect(tubes[1].order).toHaveBeenCalled();
          });

          xit("sets the uuid of the saved batch", function () {
            expect(savedBatch).toBeDefined();
            expect(savedBatch.uuid).toBe(expectedBatchUuid);
          });

          it("calls update on each order correctly", function () {
            debugger;
            expect(orders[0].update).toHaveBeenCalledWith({
              //user:"username",
              items:{
                tube_to_be_extracted:{
                  "tube1_UUID":{ batch_UUID:"batch_UUID" },
                  "tube2_UUID":{ batch_UUID:"batch_UUID" }
                }
              }
            });
          });
        });

      });
    });
  });
});
