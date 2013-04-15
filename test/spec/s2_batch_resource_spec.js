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
          runs(function () {
            Root.load({user:"username"})
                .then(results.assignTo('root'))
                .then(function () {
                  s2 = results.get('root');
                })
                .then(function () {
                  return s2.find("batch_UUID");
                })
                .then(results.assignTo('batch'))
                .then(function () {
                  batch = results.get('batch');
                })
                .then(results.expected)
                .fail(results.unexpected);
          });
          waitsFor(results.hasFinished);
        });

        it("yields the orders found", function () {
          results.resetFinishedFlag();
          runs(function () {
            batch.orders.then(results.assignTo('orders'))
                .then(results.expected)
                .fail(results.unexpected);
          });

          waitsFor(results.hasFinished);

          runs(function () {
            expect(results.get('orders').length).toBe(2);
          });
        });

        it("yields all the items in the batch, from all the orders", function () {
          results.resetFinishedFlag();
          runs(function () {
            batch.items.then(results.assignTo('items'))
                .then(results.expected)
                .fail(results.unexpected);
          });

          waitsFor(results.hasFinished);

          runs(function () {
            expect(results.get('items').length).toBe(3);
          });
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
          runs(function () {
            config.loadTestData(dataForBatchOneTube);
            Root.load({user:"username"})
                .then(results.assignTo('root'))
                .then(function () {
                  s2 = results.get('root');
                })
                .then(function () {
                  return s2.tubes.findByEan13Barcode('tube1_BC')
                })
                .then(function (tube) {
                  tube1 = tube;
                }).then(function () {
                  return tube1.order();
                })
                .then(function (theOrder) {
                  order = theOrder;
                  // We need to make sure that the order we get is always the
                  // one we are spying on
//                  spyOn(tube1, "order").andReturn(order);
                  batch = s2.batches.new({
                    resources:[ tube1 ]
                  });
                  spyOn(order, "update").andCallThrough();
                })
                .then(results.expected)
                .fail(results.unexpected);

          });
          waitsFor(results.hasFinished);
        });

        it("has one item", function () {
          expect(batch.resources.length).toBe(1);
        });

        describe("saving", function () {
          var expectedBatchUuid = "batch_UUID",
              savedBatch = undefined;

          var savingPromise;

          beforeEach(function () {
            results.resetFinishedFlag();
            runs(function () {

              spyOn(s2.batches, "create").andCallThrough();
              spyOn(config, "ajax").andCallThrough();
              batch.save().
                  then(function (batch) {
                    savedBatch = batch;
                  })
                  .then(results.expected)
                  .fail(results.unexpected);
            });
            waitsFor(results.hasFinished);

          });

          it("creates a new batch", function () {
            runs(function () {
              expect(s2.batches.create).toHaveBeenCalledWith({user:"username"});
            });
          });

          it("sets the uuid of the saved batch", function () {
            runs(function () {
              expect(savedBatch).toBeDefined();
              expect(savedBatch.uuid).toBe(expectedBatchUuid);
            });
          });

          it("calls update on each order correctly", function () {
            var expectedOptions = {type:"PUT",
              url:"/order1_UUID",
              dataType:'json',
              headers:{"Content-Type":'application/json'},
              data:'{"user":"username","items":{"tube_to_be_extracted":{"tube1_UUID":{"batch_uuid":"batch_UUID"}}}}'
            };
            runs(function () {
              expect(config.ajax).toHaveBeenCalledWith(expectedOptions);
            });
          });

        });
      });

      describe("New unsaved batch with two tube items in one order", function () {

        var batch,
            order1, order2,
            tube1, tube2;

        beforeEach(function () {

//          mockOrderPromise1 = $.Deferred();
//          mockOrderPromise2 = $.Deferred();

          runs(function () {
            results.resetFinishedFlag();
            config.loadTestData(dataForBatchTwoTubes);
            Root.load({user:"username"})
                .then(results.assignTo('root'))
                .then(function () {
                  s2 = results.get('root');
                  return s2.tubes.findByEan13Barcode('tube1_BC');
                })
                .then(function (tube) {
                  tube1 = tube;
                  return tube1.order();
                })
                .then(function (theOrder) {
                  order1 = theOrder;
                  return s2.tubes.findByEan13Barcode('tube2_BC');
                })
                .then(function (tube) {
                  tube2 = tube;
                  return tube2.order();
                })
                .then(function (theOrder2) {
                  order2 = theOrder2;

                  batch = s2.batches.new({
                    resources:[tube1, tube2]
                  });

                  spyOn(order1, "update").andCallThrough();
                  spyOn(order2, "update").andCallThrough();

                })
                .then(results.expected)
                .fail(results.unexpected);
          });
          waitsFor(results.hasFinished);

        });

        it("can find first and second tubes", function () {
          expect(tube1).toBeDefined();
          expect(tube2).toBeDefined();
        });

        it("has two items", function () {
          expect(batch.resources.length).toBe(2);
        });

        it(", both of the same order (making sure the test data are correct)", function () {
          $.when(order1, order2).then(function () {
            expect(order1.uuid).toEqual(order2.uuid);
          });

        });

        describe("saving", function () {
          var expectedBatchUuid = "batch_UUID",
              savedBatch;

          beforeEach(function () {
            runs(function () {
              results.resetFinishedFlag();

              spyOn(s2.batches, "create").andCallThrough();
              spyOn(config, "ajax").andCallThrough();
              batch.save().
                  then(function (batch) {
                    savedBatch = batch;
                  })
                  .then(results.expected)
                  .fail(results.unexpected);
            });
            waitsFor(results.hasFinished);

          });

          it("creates a new batch", function () {
            var expectedOptions = {type:"POST",
              url:"/batches",
              dataType:'json',
              headers:{"Content-Type":'application/json'},
              data:'{"batch":{"user":"username"}}'
            };
            runs(function () {
              expect(config.ajax).toHaveBeenCalledWith(expectedOptions);
            });
          });

          it("sets the uuid of the saved batch", function () {
            runs(function () {
              expect(savedBatch).toBeDefined();
              expect(savedBatch.uuid).toBe(expectedBatchUuid);
            });
          });

          it("calls update on each order correctly (which means only one here)", function () {
            var expectedOptions = {type:"PUT",
              url:"/order1_UUID",
              dataType:'json',
              headers:{"Content-Type":'application/json'},
              data:'{"user":"username","items":{"tube_to_be_extracted":{"tube1_UUID":{"batch_uuid":"batch_UUID"},"tube2_UUID":{"batch_uuid":"batch_UUID"}}}}'
            };
            runs(function () {
              expect(config.ajax).toHaveBeenCalledWith(expectedOptions);
            });
          });
        });

      });

      describe("New unsaved batch with one tube from an order with two items", function () {

        var batch,
            order1, order2,
            tube1, tube2;

        beforeEach(function () {

          config.loadTestData(dataForBatchOneTubeOneOrderWithTwoTubes);
          runs(function () {
            Root.load({user:"username"})
                .then(results.assignTo('root'))
                .then(function () {
                  s2 = results.get('root');
                  return s2.tubes.findByEan13Barcode('tube1_BC')
                })
                .then(function (tube) {
                  tube1 = tube;
                  return tube1.order();
                })
                .then(function (theOrder) {
                  order1 = theOrder;
                  return s2.tubes.findByEan13Barcode('tube2_BC');
                })
                .then(function (atube) {
                  tube2 = atube;
                  return tube2.order();
                }).then(function (theOrder2) {
                  order2 = theOrder2;
                  // there's only one tube in the batch !
                  batch = s2.batches.new({
                    resources:[tube1]
                  });

                  spyOn(order1, "update").andCallThrough();
                  spyOn(order2, "update").andCallThrough();
                })
                .then(results.expected)
                .fail(results.unexpected);
          });
          waitsFor(results.hasFinished);

        });

        it("can find first and second tubes", function () {
          runs(function () {
            expect(tube1).toBeDefined();
            expect(tube2).toBeDefined();
          });
        });

        it("has one item", function () {
          runs(function () {
            expect(batch.resources.length).toBe(1);
          });
        });

        it(", both tube of the same order (making sure the test data are correct)", function () {
          runs(function () {
            expect(order1.uuid).toEqual(order2.uuid);
          });
        });

        describe("saving", function () {
          var expectedBatchUuid = "batch_UUID",
              savedBatch;

          beforeEach(function () {
            runs(function () {
              results.resetFinishedFlag();
              spyOn(s2.batches, "create").andCallThrough();
              spyOn(config, "ajax").andCallThrough();
              batch.save()
                  .then(function (batch) {
                    savedBatch = batch;
                  })
                  .then(results.expected)
                  .fail(results.unexpected);
            });
            waitsFor(results.hasFinished);
          });

          it("creates a new batch", function () {
            var expectedOptions = {type:"POST",
              url:"/batches",
              dataType:'json',
              headers:{"Content-Type":'application/json'},
              data:'{"batch":{"user":"username"}}'
            };
            runs(function () {
              expect(config.ajax).toHaveBeenCalledWith(expectedOptions);
            });
          });

          it("sets the uuid of the saved batch", function () {
            runs(function () {
              expect(savedBatch).toBeDefined();
              expect(savedBatch.uuid).toBe(expectedBatchUuid);
            });
          });

          it("calls update on one order correctly (which means only one call here, with only one tube)", function () {
            var expectedOptions = {type:"PUT",
              url:"/order1_UUID",
              dataType:'json',
              headers:{"Content-Type":'application/json'},
              data:'{"user":"username","items":{"tube_to_be_extracted":{"tube1_UUID":{"batch_uuid":"batch_UUID"}}}}'
            };
            runs(function () {
              expect(config.ajax).toHaveBeenCalledWith(expectedOptions);
            });
          });

        });

        describe("update roles", function () {
          var expectedBatchUuid = "batch_UUID",
              savedBatch,
              tubesByOrders;

          beforeEach(function () {
            runs(function () {
              results.resetFinishedFlag();
              spyOn(s2.batches, "create").andCallThrough();
              spyOn(config, "ajax").andCallThrough();
              batch.save()
                  .then(function (resultbatch) {
                    savedBatch = resultbatch;
                    return savedBatch.items;
                  })
                  .then(function (items) {
                    return savedBatch.getItemsGroupedByOrders();
                  })
                  .then(function (result) {
                    tubesByOrders = result;
                  })
                  .then(results.expected)
                  .fail(results.unexpected);
            });
            waitsFor(results.hasFinished);
          });

          it("finds the correct 'tubes by orders'", function () {
            runs(function () {
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
});
