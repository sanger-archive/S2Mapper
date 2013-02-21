require.config ({
    shim:{
    },

    paths:{
        domReady:'components/requirejs-domready/domReady',
        mapper:  'scripts/mapper',
        config:  'test_config',
        spec:    'spec',
        json:    'json',
    },

});

require (['domReady!', 'spec/s2_ajax_spec', 'spec/s2_tube_spec'], function () {
    window.setTimeout (runJasmineTests, 1000);
});
