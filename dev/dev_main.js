require.config({
  shim: {
  },

  paths: {
    hm: 'vendor/hm',
    esprima: 'vendor/esprima',
    jquery: 'vendor/jquery.min',
    config: 'test_config',
    json: '../test/json',
    example: '../test',
    text:    '../components/requirejs-text/text'

  }
});
require(['config','scripts/mapper/s2_ajax'],
  function(config, S2Ajax) {

  s2ajax = new S2Ajax;

  $('#nextStage').click(function (){
    //TODO - this will increment the json pointer
    s2ajax.send();
  });
});
