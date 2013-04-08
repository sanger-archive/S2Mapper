define([
  'resource_test_helper',
  'config',
  'mapper/s2_root',
  'text!json/unit/batch_resource_spec_data/data_for_orders.json',
  'text!json/unit/batch_resource_spec_data/data_for_unsaved_batch_one_tube.json',
  'text!json/unit/batch_resource_spec_data/data_for_unsaved_batch_two_tubes.json',
  'text!json/unit/batch_resource_spec_data/data_for_unsaved_batch_one_tube_in_order_with_two.json'
], function (TestHelper, config, Root, dataForOrder, dataForBatchOneTube, dataForBatchTwoTubes, dataForBatchOneTubeOneOrderWithTwoTubes) {
  'use strict';

  TestHelper(function (results) {
    describe("Batch Resource:-", function () {

      results.lifeCycle();

      var s2;

      describe("orders & items : ", function () {
        var batch;

        beforeEach(function () {
          config.loadTestData(dataForOrder);
          Root.load({user:"username"}).done(results.assignTo('root'));
          s2 = results.get('root');

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

      describe("New unsaved empty batch", function () {
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

          config.loadTestData(dataForBatchOneTube);
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
              savedBatch = undefined;

          var savingPromise;

          beforeEach(function () {
            spyOn(s2.batches, "create").andCallThrough();
            spyOn(config, "ajax").andCallThrough();
            savingPromise = batch.save().
                done(function (batch) {
                  savedBatch = batch;
                });
          });

          it("the saving promise is a success", function () {
            expect(savingPromise.state()).toEqual("resolved");
          });

          it("creates a new batch", function () {
            expect(s2.batches.create).toHaveBeenCalledWith({user:"username"});
          });

          it("extracts the order from the tube", function () {
            expect(tube1.order).toHaveBeenCalled();
          });

          it("sets the uuid of the saved batch", function () {
            expect(savedBatch).toBeDefined();
            expect(savedBatch.uuid).toBe(expectedBatchUuid);
          });

          it("calls update on each order correctly", function () {
            var expectedOptions = {type:"PUT",
              url:"/order1_UUID",
              dataType:'json',
              headers:{"Content-Type":'application/json'},
              data:'{"user":"username","items":{"tube_to_be_extracted":{"tube1_UUID":{"batch_uuid":"batch_UUID"}}}}'
            };
            expect(config.ajax).toHaveBeenCalledWith(expectedOptions);
          });

        });
      });

      describe("New unsaved batch with two tube items in one order", function () {

        var batch,
            order1, order2,
            mockOrderPromise1,
            mockOrderPromise2,
            tube1, tube2;

        beforeEach(function () {

          mockOrderPromise1 = $.Deferred();
          mockOrderPromise2 = $.Deferred();

          config.loadTestData(dataForBatchTwoTubes);
          Root.load({user:"username"}).done(results.assignTo('root'));
          s2 = results.get('root');
          s2.tubes.findByEan13Barcode('tube1_BC').done(
              function (tube) {
                tube1 = tube;
              }).then(function () {
                tube1.order().done(function (theOrder) {
                  order1 = theOrder;
                  mockOrderPromise1.resolve(order1);
                })
              });
          s2.tubes.findByEan13Barcode('tube2_BC').done(
              function (atube) {
                tube2 = atube;
              }).then(function () {
                tube2.order().done(function (theOrder2) {
                  order2 = theOrder2;
                  mockOrderPromise2.resolve(order2);
                })
              });

          spyOn(tube1, "order").andReturn(mockOrderPromise1);
          spyOn(tube2, "order").andReturn(mockOrderPromise2);

          batch = s2.batches.new({
            resources:[tube1, tube2]
          });

          spyOn(order1, "update").andCallThrough();
          spyOn(order2, "update").andCallThrough();
        });

        it("can find first and second tubes", function () {
          $.when(mockOrderPromise1, mockOrderPromise2).then(function () {
            expect(tube1).toBeDefined();
            expect(tube2).toBeDefined();
          });
        });

        it("has two items", function () {
          expect(batch.resources.length).toBe(2);
        });

        it(", both of the same order (making sure the test data are correct)", function () {
          $.when(mockOrderPromise1, mockOrderPromise2).then(function () {
            expect(order1.uuid).toEqual(order2.uuid);
          });

        });

        describe("saving", function () {
          var expectedBatchUuid = "batch_UUID",
              savedBatch;

          beforeEach(function () {
            spyOn(s2.batches, "create").andCallThrough();
            spyOn(config, "ajax").andCallThrough();
            batch.save().
                done(function (batch) {
                  savedBatch = batch;
                }).fail(function () {
                  //debugger;
                });
          });

          it("creates a new batch", function () {
            var expectedOptions = {type:"POST",
              url:"/batches",
              dataType:'json',
              headers:{"Content-Type":'application/json'},
              data:'{"batch":{"user":"username"}}'
            };
            expect(config.ajax).toHaveBeenCalledWith(expectedOptions);
          });

          it("extracts both orders from both tubes", function () {
            expect(tube1.order).toHaveBeenCalled();
            expect(tube2.order).toHaveBeenCalled();
          });

          it("sets the uuid of the saved batch", function () {
            expect(savedBatch).toBeDefined();
            expect(savedBatch.uuid).toBe(expectedBatchUuid);
          });

          it("calls update on each order correctly (which means only one here)", function () {
            var expectedOptions = {type:"PUT",
              url:"/order1_UUID",
              dataType:'json',
              headers:{"Content-Type":'application/json'},
              data:'{"user":"username","items":{"tube_to_be_extracted":{"tube1_UUID":{"batch_uuid":"batch_UUID"},"tube2_UUID":{"batch_uuid":"batch_UUID"}}}}'
            };
            expect(config.ajax).toHaveBeenCalledWith(expectedOptions);
          });
        });

      });

      describe("New unsaved batch with one tube from an order with two items", function () {

        var batch,
            order1, order2,
            mockOrderPromise1,
            mockOrderPromise2,
            tube1, tube2;

        beforeEach(function () {

          mockOrderPromise1 = $.Deferred();
          mockOrderPromise2 = $.Deferred();

          config.loadTestData(dataForBatchOneTubeOneOrderWithTwoTubes);
          Root.load({user:"username"}).done(results.assignTo('root'));
          s2 = results.get('root');
          s2.tubes.findByEan13Barcode('tube1_BC').done(
              function (tube) {
                tube1 = tube;
              }).then(function () {
                tube1.order().done(function (theOrder) {
                  order1 = theOrder;
                  mockOrderPromise1.resolve(order1);
                })
              });
          s2.tubes.findByEan13Barcode('tube2_BC').done(
              function (atube) {
                tube2 = atube;
              }).then(function () {
                tube2.order().done(function (theOrder2) {
                  order2 = theOrder2;
                  mockOrderPromise2.resolve(order2);
                })
              });

          spyOn(tube1, "order").andReturn(mockOrderPromise1);
          spyOn(tube2, "order").andReturn(mockOrderPromise2);

          // there's only one tube in the batch !
          batch = s2.batches.new({
            resources:[tube1]
          });

          spyOn(order1, "update").andCallThrough();
          spyOn(order2, "update").andCallThrough();
        });

        it("can find first and second tubes", function () {
          $.when(mockOrderPromise1, mockOrderPromise2).then(function () {
            expect(tube1).toBeDefined();
            expect(tube2).toBeDefined();
          });
        });

        it("has one item", function () {
          expect(batch.resources.length).toBe(1);
        });

        it(", both tube of the same order (making sure the test data are correct)", function () {
          $.when(mockOrderPromise1, mockOrderPromise2).then(function () {
            expect(order1.uuid).toEqual(order2.uuid);
          });

        });

        describe("saving", function () {
          var expectedBatchUuid = "batch_UUID",
              savedBatch;

          beforeEach(function () {
            spyOn(s2.batches, "create").andCallThrough();
            spyOn(config, "ajax").andCallThrough();
            batch.save().
                done(function (batch) {
                  savedBatch = batch;
                }).fail(function () {
                  //debugger;
                });
          });

          it("creates a new batch", function () {
            var expectedOptions = {type:"POST",
              url:"/batches",
              dataType:'json',
              headers:{"Content-Type":'application/json'},
              data:'{"batch":{"user":"username"}}'
            };
            expect(config.ajax).toHaveBeenCalledWith(expectedOptions);
          });

          it("extracts only one order because there's only one tube concerned", function () {
            expect(tube1.order).toHaveBeenCalled();
            expect(tube2.order).not.toHaveBeenCalled();
          });

          it("sets the uuid of the saved batch", function () {
            expect(savedBatch).toBeDefined();
            expect(savedBatch.uuid).toBe(expectedBatchUuid);
          });

          it("calls update on one order correctly (which means only one call here, with only one tube)", function () {
            var expectedOptions = {type:"PUT",
              url:"/order1_UUID",
              dataType:'json',
              headers:{"Content-Type":'application/json'},
              data:'{"user":"username","items":{"tube_to_be_extracted":{"tube1_UUID":{"batch_uuid":"batch_UUID"}}}}'
            };
            expect(config.ajax).toHaveBeenCalledWith(expectedOptions);
          });

        });

        describe("update roles", function () {
          var expectedBatchUuid = "batch_UUID",
              savedBatch,
              tubesByOrders;

          beforeEach(function () {
            spyOn(s2.batches, "create").andCallThrough();
            spyOn(config, "ajax").andCallThrough();
            batch.save()
                .then(function (resultbatch) {
                  savedBatch = resultbatch;
                  return savedBatch.items;
                })
                .then(function (items) {
                  return savedBatch.getResourcesGroupedByOrders();
                })
                .then(function (result) {
                  tubesByOrders = result;
                })
                .fail(function () {
                  debugger;
                });
          });

          it("finds the correct 'tubes by orders'", function () {

            expect(tubesByOrders["order1_UUID"]).toBeDefined();
            expect(tubesByOrders["order1_UUID"].items.length).toEqual(2);
            expect(tubesByOrders["order1_UUID"].items[0].uuid).toBeDefined();

            if (tubesByOrders["order1_UUID"].items[0].uuid == "tube1_UUID") {
              expect(tubesByOrders["order1_UUID"].items[1].uuid).toEqual("tube2_UUID");
            } else {
              expect(tubesByOrders["order1_UUID"].items[0].uuid).toEqual("tube2_UUID");
              expect(tubesByOrders["order1_UUID"].items[1].uuid).toEqual("tube1_UUID");
            }
          });

        });

      });
    });
  });
});
