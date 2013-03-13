define([
  'mapper/s2_base_resource',
  'mapper/s2_tube_resource',
  'mapper/s2_order_resource',
  'mapper/s2_barcode_resource',
  'mapper/s2_batch_resource',
  'mapper/support/pluralization'
], function(BaseResource, TubeResource, OrderResource, BarcodeResource, BatchResource) {
  return {
    tube:    TubeResource,
    order:   OrderResource,
    barcode: BarcodeResource,
    batch:   BatchResource,

    // Functions
    get: function(name) {
      return this[name.singularize()]? this[name.singularize()] : this.base;
    },

    base: BaseResource
  };
});
