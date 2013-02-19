require.config({
  shim: {
    },

  paths: {
      domReady: 'components/requirejs-domready/domReady',
      mapper: 'scripts/mapper',
      config: 'dev_config',
      json: 'json',
    },

});

require(['domReady!', 'mapper/s2_resource'], function(domReady, S2Resource) {
});
