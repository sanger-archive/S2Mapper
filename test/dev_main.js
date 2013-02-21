require.config ({
    shim: {
    },
    paths:{
        domReady:'components/requirejs-domready/domReady',
        mapper:  'scripts/mapper',
        config:  'dev_config',
        json:    'json',
        jquery:  'components/jquery/jquery'
    }
});

require (['domReady!', 'mapper/s2_resource'], function (domReady, S2Resource) {
    console.log ('Running in dev environment');
});
