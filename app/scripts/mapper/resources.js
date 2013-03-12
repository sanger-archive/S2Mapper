define([
  'mapper/s2_base_resource',
  'mapper/s2_tube_resource',
  'mapper/s2_order_resource',
  'mapper/s2_barcode_resource',
  'mapper/s2_batch_resource'
], function(BaseResource, TubeResource, OrderResource, BarcodeResource, BatchResource) {
  return {
    // Pluralised resource type names
    tubes:    TubeResource,
    orders:   OrderResource,
    barcodes: BarcodeResource,
    batches:  BatchResource,

    // Singularised resource type names
    tube:    TubeResource,
    order:   OrderResource,
    barcode: BarcodeResource,
    batch:   BatchResource

    // Functions
    get: function(name) {
      return this[name]? this[name] : this.base;
    },

    base: BaseResource
  };
});
