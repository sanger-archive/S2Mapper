require.config({
  shim: {
  },
  paths:{
    domReady:'components/requirejs-domready/domReady',
    mapper:  'scripts/mapper',
    config:  'test_config',
    spec:    'spec',
    json:    'json',
    text:    'components/requirejs-text/text'
  }
});

require([
        'domReady!',
        'spec/s2_ajax_spec',
        'spec/s2_resource_factory_spec',
        'spec/s2_base_resource_spec',
        'spec/s2_tube_resource_spec',
        'spec/s2_order_resource_spec',
        'spec/s2_batch_resource_spec',
        'spec/s2_root_spec',
        'spec/integration/dna_only_extraction_spec'
], function() {
  window.setTimeout(runJasmineTests, 100);
});
