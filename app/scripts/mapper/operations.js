define(['mapper/support/deferred'], function(Deferred) {
  'use strict';

  return {
    /*
     * Create an operation that does prepare -> start -> operate -> complete.
     */
    operation: function(definition) {
      return Deferred.sequentially(
        definition.prepare,
        definition.start,
        definition.operate,
        definition.complete
      ).promise();
    },

    /*
     * Registers a piece of labware that will be for a specified role and contain a specified
     * type of aliquot.
     *
     * - 'model' is the S2 root model object to instantiate;
     * - 'intendedContents' is along the lines of 'DNA', 'RNA', 'NA+P', 'DNA+P', etc;
     * - 'intendedRole' is the purpose of the labware, like 'stock', not a role in an order;
     * - 'attributes' are additional attributes pass into labware creation.
     */
    registerLabware: function(model, intendedContents, intendedRole, attributes) {
      return Deferred.sequentially(function(state) {
        return model.create(attributes || {});
      }, function(state, labware) {
        state['labware'] = labware;
        return labware.root.barcodes.create({
          labware:  labware.resourceType,
          role:     intendedRole,
          contents: intendedContents
        });
      }, function(state, barcode) {
        state['barcode'] = barcode;
        return barcode.label(state.labware);
      }).promise();
    },

    /*
     * Handles performing an operation between some labware within an order.  The idea is that
     * the 'model' performs the operation (think "transfer" or "movement") and the preparation
     * is all the work that has to be done to set this up (maybe registering labware).  This
     * preparation is an array of functions that takes the 'operations' (an array of movements
     * or transfers) and the state, returning a deferred object.  Therefore the preparation
     * functions push an operation on to the operations.  For more information on the operations
     * structure see 'stateManagement' below, as the 'operation' is translated into an 'update'
     * by this function.
     */
    betweenLabware: function(model, preparation) {
      return $.extend(this.stateManagement(), {
        prepare: function(state) {
          state['operations'] = [];

          return _.partial(Deferred.in_parallel, state).apply(
            Deferred,
            _.map(preparation, function(f) { return _.partial(f, state.operations); })
          ).then(function() {
            state['updates'] = _.map(state.operations, function(details) {
              return { input: details.input, output: details.output };
            });
          });
        },

        operate: function(state) {
          return model.create(model.extract(state.operations));
        }
      });
    },

    /*
     * Returns a partial implementation of the structure needed for an 'operation'.  It deals with
     * the 'start' and 'complete' callbacks, and provides an 'operation' method for turning the
     * instance into an operation.
     *
     * It expects the state to contain 'updates' which should be an array contain objects with the
     * following keys (dotted notation):
     *
     * - 'input.order' is the order for the input resource being modified;
     * - 'input.resource' is the input resource being used;
     * - 'input.role' is the input role of the resource;
     * - 'output.resource' is the output resource being added to the order and then completed;
     * - 'output.role' is the output role of the resource in the order.
     */
    stateManagement: function() {
      var Operations = this;
      return {
        start: function(state) {
          return updateItemsInOrders(
            _.chain(state.updates).map(function(update) {
              return { order: update.input.order, resource: update.output.resource, role: update.output.role, update: { state: 'started' } };
            }).value()
          );
        },

        complete: function(state) {
          return updateItemsInOrders(
            _.chain(state.updates).map(function(update) {
              return [
                { order: update.input.order, resource: update.input.resource,  role: update.input.role,  update: { event: 'unuse'    } },
                { order: update.input.order, resource: update.output.resource, role: update.output.role, update: { event: 'complete' } }
              ];
            }).flatten().value()
          );
        },

        operation: function() {
          return Operations.operation(this);
        }
      };

      // A repetitive pattern for updating items across orders
      function updateItemsInOrders(updates) {
        return Deferred.in_parallel.apply(Deferred,
          _.chain(updates).groupBy(function(u) {
            return u.order.uuid;
          }).map(function(updates, uuid) {
            var order = updates[0].order; // Hack because keys of objects can't be objects!
            return [
              order,
              _.chain(updates).reduce(
                function(m, i) { (m[i.role] = m[i.role] || {})[i.resource.uuid] = i.update; return m; },
                {}
              ).value()
            ];
          }).map(function(pair) {
            return function() {
              return pair[0].update({ items: pair[1] });
            };
          }).value()
        );
      }
    }
  };
});
