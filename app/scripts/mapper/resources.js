define([
  'mapper/support/pluralization',
  'mapper/s2_base_resource',

  // Add new resources for automatic inclusion after this point
  'mapper/s2_tube_resource',
  'mapper/s2_order_resource',
  'mapper/s2_barcode_resource',
  'mapper/s2_batch_resource',
], function(ignoreStringStuff, BaseResource) {
  'use strict';

  // This is the registry for all resource classes, mapped from the name in the JSON.
  var registry = {
    base: BaseResource,
    get: function(name) { return this[name.singularize()]? this[name.singularize()] : this.base; }
  };

  // Register all of the resources into the registry.
  function register(name, resourceType) { registry[name.singularize()] = resourceType; }
  for (var i = 2; i < arguments.length; i++) {
    arguments[i].register(register);
  }
  return registry;
});
