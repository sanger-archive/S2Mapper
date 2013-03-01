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
        'spec/s2_resource_spec',
        'spec/s2_base_resource_spec',
        'spec/s2_tube_resource_spec',
        'spec/s2_root_spec'
], function() {
  window.setTimeout(runJasmineTests, 100);
});
