require.config({
  baseUrl: "../app",
  shim: {
  },
  paths:{
    domReady:              'components/requirejs-domready/domReady',
    mapper:                'scripts/mapper',
    test:                  '../test',
    config:                '../test/test_config',
    spec:                  '../test/spec',
    json:                  '../test/json',
    mapper_testjson:       '../test/json',
    text:                  'components/requirejs-text/text',
    resource_test_helper:  '../test/resource_test_helper'
  }
});

require([
    'domReady!',
    'spec/support/test_config_spec',
    'spec/support/pluralization_spec',
    'spec/support/deferred_spec',
    'spec/services/print_spec',
    'spec/s2_ajax_spec',
    'spec/s2_search_resource_spec',
    'spec/s2_labeling_module_spec',
    'spec/s2_base_resource_spec',
    'spec/s2_sample_resource_spec',
    'spec/s2_tube_resource_spec',
    'spec/s2_labellable_resource_spec',
    'spec/s2_spin_column_resource_spec',
    'spec/s2_tube_rack_resource_spec',
    'spec/s2_gel_resource_spec',
    'spec/s2_plate_resource_spec',
    'spec/s2_kit_resource_spec',
    'spec/s2_order_resource_spec',
    'spec/s2_batch_resource_spec',
    'spec/s2_root_spec',
    'spec/s2_barcode_resource_spec',
    'spec/operations_spec',
    'spec/integration/dna_only_extraction_spec'
], function() {
  mocha.run();
});