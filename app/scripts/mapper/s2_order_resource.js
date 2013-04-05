define([
  'mapper/s2_base_resource'
], function (BaseResource) {
  'use strict';

  var Order = BaseResource.extendAs('order', function (orderInstance, options) {
    extendItemBehaviour(orderInstance);
    $.extend(orderInstance, instanceMethods);
    return orderInstance;
  });

  var instanceMethods = {
    /*
     * Asynchronously find the batch based on the given predicate.  The predicate takes two arguments:
     *
     * - the current item being examined;
     * - the order being checked.
     *
     * Calls the 'done' handler on the returned promise with the first batch found, and the 'fail' handler
     * should none be found.
     */
    batchFor:function (criteria) {
      var deferredObject = $.Deferred();

      var root = this.root, order = this.order, batch = null;

      var filteredItems = this.items.filter(function (item) {
        return (item.batch !== null) && criteria(item, order);
      });

      if(filteredItems.length > 0){
        root.batches.instantiate({rawJson:{batch:filteredItems[0].batch}}).read()
            .then(function(batch){
              deferredObject.resolve(batch);
            }).fail(function(){
              deferredObject.reject();
            });
      } else {
        deferredObject.reject();
      }
      return deferredObject.promise();
    },

    setBatchForResources:function (batch, resourceUUIDs, filteringStatus) {
      // updates the role status of the items, inserting the batch UUID
      // but ONLY if the items is one of the concerned ones, ie one of the labware added to the batch
      // If a filteringStatus is given, it only applies to the role with this status.
      var updateJson = { "items":{} };
      // for each role
      _.each(this.items, function (labwares, role, list) {
        // for each labware (ie tube)
        var labwaresInBatch = labwares.filter(function (labware) {
          // filtering the unnecessary tubes
          return _.contains(resourceUUIDs, labware.uuid);
        });
        // well... for each labware concerned (ie tube added to the batch)
        _.each(labwaresInBatch, function (labware) {
              // we update a piece of JSON
              if (!filteringStatus || labware.status === filteringStatus) {
                if (!updateJson.items[role]) {
                  updateJson.items[role] = {};
                }
                updateJson.items[role][labware.uuid] = { "batch_uuid":batch.uuid };
              }
            }
        );
      });
      // and then pass it to the order for update
      return this.update(updateJson);
    },

    addRoleForResources:function (resourceUUIDs, newRole) {
      var updateJson = {"items":{}};
      updateJson.items[newRole] = {};
      _.each(resourceUUIDs, function (UUID) {
        updateJson.items[newRole][UUID] = {"event":"start"};
      });
      var updatedVersion = $.Deferred();
      return this.update(updateJson);
    },

    setNewRoleForResources:function (resourceUUIDs, newRole, eventForNew, oldRole, eventForOld) {
      var updateJson = {"items":{}};
      var oldRoleJson = {};
      if (oldRole) {
        oldRoleJson = generateJsonEventForResourcesAndRole(this, eventForOld, resourceUUIDs, oldRole, "done");
        $.extend(true, updateJson, oldRoleJson);
      }
      var newRoleJson = {};
      newRoleJson = generateJsonEventForResourcesAndRole(this, eventForNew, resourceUUIDs, newRole);
      $.extend(true, updateJson, newRoleJson);
      return this.update(updateJson);
    }
  };

  function extendItemBehaviour(order) {
    // Helper functions for dealing with the items structure
    function notFunction(x) {
      return typeof x !== 'function';
    }

    Object.defineProperties(order, {
      items:{
        get:function () {
          // Instance methods for the items structure
          return $.extend(Object.create({
            filter:function (fn) {
              return _.chain(this).values().flatten().filter(fn).value();
            }
          }), _.chain(order.rawJson.order.items).pairs().reduce(function (items, pair) {
            items[pair[0]] = _.map(pair[1], function (item) {
              return $.extend({ order:order, role:pair[0] }, item);
            });
            return items;
          }, {}).value());
        }
      }
    });
  }

  function generateJsonEventForResourcesAndRole(order, event, resourceUUIDs, filteringRole, filteringStatus) {
    var JSONForEvent = { "items":{} };
    // for each role
    _.each(order.items, function (labwares, role, list) {
      // for each labware (ie tube)
      if (!filteringRole || role === filteringRole) {
        var labwaresInBatch = labwares.filter(function (labware) {
          // filtering the unnecessary tubes
          return _.contains(resourceUUIDs, labware.uuid);
        });
        // well... for each labware concerned (ie tube added to the batch)
        _.each(labwaresInBatch, function (labware) {
              // we update a piece of JSON
              if (!filteringStatus || labware.status === filteringStatus) {
                if (!JSONForEvent.items[filteringRole]) {
                  JSONForEvent.items[filteringRole] = {};
                }
                JSONForEvent.items[filteringRole][labware.uuid] = { "event":event };
              }
            }
        );
      }
    });
    return JSONForEvent;
  }

  return Order;
});


