require.config({
  shim: {
    },

  paths: {
      hm: 'vendor/hm',
      esprima: 'vendor/esprima',
      jquery: 'vendor/jquery.min',
      config: 'test_config',
      spec: 'spec',
      json: 'json'
    }
});
 
require(['spec/s2_ajax_spec'], function(app) {
  // use app here
});
