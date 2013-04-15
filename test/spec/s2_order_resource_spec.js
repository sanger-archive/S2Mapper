define([
  'resource_test_helper',
  'config',
  'mapper/s2_root',
  'mapper/operations',
  'text!json/unit/root.json',
  'text!json/unit/order_without_batch.json',
  'text!json/unit/order_with_batch.json',
  'text!json/unit/order_resource_spec_data/data_for_order_with_two_tubes_update.json'

], function (TestHelper, config, Root, Operations, rootTestJson, orderWithoutBatchJson, orderWithBatchJson, dataForOrderWithTwoTubesUpdate) {
  'use strict';

  var s2, results;

  TestHelper(function (results) {
    describe("Order Resource:-", function () {
      results.lifeCycle();

      beforeEach(function () {
        config.loadTestData(rootTestJson);
        runs(function () {
          Root.load({user:"username"})
              .then(results.assignTo('root'))
              .then(results.expected);
        });

        waitsFor(results.hasFinished);

        runs(function () {
          s2 = results.get('root');
        });
      });

      // [sd9] WIP This test is currently useless.  Fix in progress!
      xdescribe("Calling order.getBatchFor(item), where item is a tube in the order,", function () {
        describe("and the item IS NOT in a batch,", function () {
          beforeEach(function () {
            config.cummulativeLoadingTestDataInFirstStage(orderWithoutBatchJson);
            s2.tubes.findByEan13Barcode('2345678901234').done(results.assignTo('tube'));
            results.get('tube').order().done(results.assignTo('order'));
          });

          it("returns null if the item is not in a batch.", function () {
            expect(results.get('order').getBatchFor(results.get('tube'))).toBe(null);
          });
        });

        describe("and the item IS in a batch,", function () {
          beforeEach(function () {
            config.cummulativeLoadingTestDataInFirstStage(orderWithBatchJson);
            s2.tubes.findByEan13Barcode('2345678901234').done(results.assignTo('tube'));
            results.get('tube').order().done(results.assignTo('order'));
          });

          // TODO: is this really a test????? Seriously, this has to be fixed !
          xit("returns a promise that resolves to the batch object", function () {
            var order = results.get('order');
            var tube = results.get('tube');
            expect(order.batchFor(function (item, order) {
              item.uuid == tube.uuid
            }).done).toBeDefined();
          });
        });

      });

      describe("items", function () {
        beforeEach(function () {
          config.cummulativeLoadingTestDataInFirstStage(orderWithoutBatchJson);
          results.resetFinishedFlag();
          runs(function () {
            s2.tubes.findByEan13Barcode('2345678901234')
                .then(results.assignTo('tube'))
                .then(function () {
                  return results.get('tube').order();
                })
                .then(function (order) {
                  results.assignTo('order')(order)
                })
                .then(results.expected);
          });

          waitsFor(results.hasFinished);
        });

        xdescribe("filter", function () {
          var order, tube;

          beforeEach(function () {
            order = results.get('order');
            tube = results.get('tube');
          });

          it("returns items array if items found", function () {
            expect(order.items.filter(function (item) {
              return true;
            }).length).toBe(2);
          });

          it("returns and empty array if no roles found", function () {
            expect(order.items.filter(function (item) {
              return false;
            })).toEqual([]);
          });

          it("enables filtering of the items", function () {
            var results = order.items.filter(function (item) {
              return item.uuid === tube.uuid;
            });
            expect(results.length).toBe(1);
            expect(results).toContain({ uuid:tube.uuid, order:order, role:'tube_to_be_extracted', status:'done', batch:null });
          });
        });
      });
    });

    describe("Order update", function () {
      results.lifeCycle();

      var order;
      beforeEach(function () {

        config.loadTestData(rootTestJson);

        runs(function () {
          Root.load({user:"username"})
              .then(results.assignTo('root'))
              .then(function () {
                config.cummulativeLoadingTestDataInFirstStage(dataForOrderWithTwoTubesUpdate);
                s2 = results.get('root')
              })
              .then(function () {
                return s2.find("order1_UUID");
              })
              .then(results.assignTo('order'))
              .then(function () {
                return s2.find("batch_UUID");
              })
              .then(results.assignTo('batch'))
              .then(function () {
                return s2.find("tube1_UUID");
              })
              .then(results.assignTo('tube'))
              .then(results.expected)
              .fail(results.unexpected);
          spyOn(config, "ajax").andCallThrough();
        });

        waitsFor(results.hasFinished);

      });

      it("makes the right call to S2 when setting batch for one tube", function () {

        var order = results.get('order');
        var batch = results.get('batch');
        expect(order).toBeDefined();
        expect(batch).toBeDefined();
        results.resetFinishedFlag();
        var expectedOptions = {type:"PUT",
          url:"/order1_UUID",
          dataType:'json',
          headers:{"Content-Type":'application/json'},
          data:'{"user":"username","items":{"tube_to_be_extracted":{"tube1_UUID":{"batch_uuid":"batch_UUID"}}}}'
        };

        runs(function () {
          order.setBatchForResources(batch, ['tube1_UUID'], 'done')
              .then(results.expected)
              .fail(results.unexpected);
        });

        waitsFor(results.hasFinished);

        runs(function () {
          expect(config.ajax).toHaveBeenCalledWith(expectedOptions);
        });
      });

      it("makes the right call to S2 with adding role for one tube", function () {

        var order = results.get('order');
        var batch = results.get('batch');
        expect(order).toBeDefined();
        expect(batch).toBeDefined();
        results.resetFinishedFlag();
        var expectedOptions = {type:"PUT",
          url:"/order1_UUID",
          dataType:'json',
          headers:{"Content-Type":'application/json'},
          data:'{"user":"username","items":{"binding_tube_to_be_extracted":{"tube1_UUID":{"event":"start"}}}}'
        };

        runs(function () {
          order.addRoleForResources(['tube1_UUID'],
              "binding_tube_to_be_extracted")
              .then(results.expected)
              .fail(results.unexpected);
        });

        waitsFor(results.hasFinished);

        runs(function () {
          expect(config.ajax).toHaveBeenCalledWith(expectedOptions);
        });
      });

      it("makes the right call to S2 with setting role for one tube", function () {
        var order = results.get('order');
        var batch = results.get('batch');
        expect(order).toBeDefined();
        expect(batch).toBeDefined();
        results.resetFinishedFlag();
        var expectedOptions = {type:"PUT",
          url:"/order1_UUID",
          dataType:'json',
          headers:{"Content-Type":'application/json'},
          data:'{"user":"username","items":{"tube_to_be_extracted":{"tube1_UUID":{"event":"unuse"}},"binding_tube_to_be_extracted":{"tube1_UUID":{"event":"complete"}}}}'
        };

        runs(function () {
          order.addRoleForResources(['tube1_UUID'], "binding_tube_to_be_extracted")
              .then(function (order) {
                expect(_.chain(order.items).keys().contains("tube_to_be_extracted").value()).toBeTruthy();
                expect(_.chain(order.items).keys().contains("binding_tube_to_be_extracted").value()).toBeTruthy();
                return order.setNewRoleForResources(['tube1_UUID'],
                    "binding_tube_to_be_extracted", 'complete',
                    "tube_to_be_extracted", 'unuse');
              }).then(results.expected)
              .fail(results.unexpected);
        });

        waitsFor(results.hasFinished);

        runs(function () {
          expect(config.ajax).toHaveBeenCalledWith(expectedOptions);
        });
      });

      it("after the right calls to set roles, the order has been updated (NOT based in server returned data)", function () {
        var order = results.get('order');
        var batch = results.get('batch');
        expect(order).toBeDefined();
        expect(batch).toBeDefined();
        results.resetFinishedFlag();

        runs(function () {

          order.addRoleForResources(['tube1_UUID'], "binding_tube_to_be_extracted")
              .then(function (order) {
                return order.setNewRoleForResources(['tube1_UUID'],
                    "binding_tube_to_be_extracted", 'complete',
                    "tube_to_be_extracted", 'unuse');
              })
//              We don't ask the server for the new version of the order!
//              Instead, we rely on the order returned by the mapper
//              Uncomment next call to ask the server for the new version.
//              .then(function () {
//                return s2.find("order1_UUID");
//              })
              .then(results.assignTo('order'))
              .then(results.expected)
              .fail(results.unexpected);
        });

        waitsFor(results.hasFinished);

        runs(function () {
          var order = results.get('order');

          var roles = _.chain(order.items).keys().value();

          expect(_.contains(roles, "tube_to_be_extracted")).toBeTruthy();
          expect(_.contains(roles, "binding_tube_to_be_extracted")).toBeTruthy();

          expect(order.items["tube_to_be_extracted"][0]["status"]).toEqual("unused");
          expect(order.items["binding_tube_to_be_extracted"][0]["status"]).toEqual("done");
        });
      });

      it("(Using Operation) start a new role", function () {
        var order = results.get('order');
        var batch = results.get('batch');
        var tube = results.get('tube');
        expect(tube).toBeDefined();
        expect(order).toBeDefined();
        expect(batch).toBeDefined();
        results.resetFinishedFlag();

        var state = {
          updates:[
            {
              input:{ order:order },
              output:{ resource:tube, role:'binding_tube_to_be_extracted' }
            }
          ]
        };
        var expectedOptions = {type:"PUT",
          url:"/order1_UUID",
          dataType:'json',
          headers:{"Content-Type":'application/json'},
          data:'{"user":"username","items":{"binding_tube_to_be_extracted":{"tube1_UUID":{"event":"start"}}}}'
        };

        runs(function () {
          Operations.stateManagement().start(state)
              .then(results.expected)
              .fail(results.unexpected);
        });

        waitsFor(results.hasFinished);

        runs(function () {
          expect(config.ajax).toHaveBeenCalledWith(expectedOptions);
        });
      });

      it("(Using Operation) update roles", function () {
        var order = results.get('order');
        var batch = results.get('batch');
        var tube = results.get('tube');
        expect(tube).toBeDefined();
        expect(order).toBeDefined();
        expect(batch).toBeDefined();
        results.resetFinishedFlag();

        var startingRole = {
          updates:[
            {
              input:{ order:order },
              output:{ resource:tube, role:'binding_tube_to_be_extracted' }
            }
          ]
        };
        var changingRoles = {
          updates:[
            {
              input:{ order:order, resource:tube, role:'tube_to_be_extracted' },
              output:{               resource:tube, role:'binding_tube_to_be_extracted' }
            }
          ]
        };
        var startingOptions = {type:"PUT",
          url:"/order1_UUID",
          dataType:'json',
          headers:{"Content-Type":'application/json'},
          data:'{"user":"username","items":{"binding_tube_to_be_extracted":{"tube1_UUID":{"event":"start"}}}}'
        };
        var expectedOptions = {type:"PUT",
          url:"/order1_UUID",
          dataType:'json',
          headers:{"Content-Type":'application/json'},
          data:'{"user":"username","items":{"tube_to_be_extracted":{"tube1_UUID":{"event":"unuse"}},"binding_tube_to_be_extracted":{"tube1_UUID":{"event":"complete"}}}}'
        };

        runs(function () {
          Operations.stateManagement().start(startingRole)
              .then(function () {
                return Operations.stateManagement().complete(changingRoles);
              })
              .then(results.expected)
              .fail(results.unexpected);
        });
        waitsFor(results.hasFinished);

        runs(function () {
          expect(config.ajax).toHaveBeenCalledWith(startingOptions);

          expect(config.ajax).toHaveBeenCalledWith(expectedOptions);

        });
      });
    });
  });
});
