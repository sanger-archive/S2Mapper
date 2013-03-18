require.config({
  shim: {
  },

  paths: {
    hm: 'vendor/hm',
    esprima: 'vendor/esprima',
    jquery: 'vendor/jquery.min',
    config: 'test_config',
    components: 'components',
    text:    'components/requirejs-text/text',
    mapper: 'scripts/mapper'

  }
});
require(['config','mapper/s2_root','text!json/dna_and_rna_manual_extraction.json'],
  function(config, S2Root,json) {
    json = $.parseJSON(json);
    //set up and array for all the steps in workflow
    config.steps = [];
    //initialise step count
    config.currentStep = 0;

    config.ajax = function (options){
      console.log(options);
      // a blank options.url should default to '/'
      options.url = options.url.replace(/http:\/\/localhost:\d+/,'');
      if (!options || options.url.length === 0){
        options.url = '/';
        options.type = 'get';
        options.data = null;
      };


      config.reqParams = options.url + options.type.toLowerCase() + JSON.stringify(options.data);
      console.log('Using dev ajax');
      console.log('Sending ajax message for ' + config.stage);
      console.log(config.reqParams);

      // We resolve the Deferred object before return so any callbacks added
      // with .done() are called as soon as they're added, which should solve
      // testing latency issues.


      var response = config.finalDna[config.reqParams];
      if (response === undefined) {
        console.log("AJAX[" + config.reqParams + "]: not found in " + JSON.stringify(config.finalDna));
      } else {
        console.log("AJAX[" + config.reqParams + "]: responding with a " + (typeof response));
      }
      //increment the step if not a GET
      if(options.type.toLowerCase() !== 'get'){
        config.currentStep++;
      }
      //return the JSON for the next step
      config.nextExpectedStep = config.steps[config.currentStep];

      return $.Deferred().resolve({
        url:           options.url,
        'status':      200,
        responseTime:  750,
        responseText:  response
      });
    }

    //populate the pipeline and finalDna

    for (var stageNum in json){
      for  (var stepNum in json[stageNum].steps) {
        var step = json[stageNum].steps[stepNum];

        config.finalDna[step.url + step.method + JSON.stringify(step.request)] = step.response;
        config.steps.push(step.description);
      }
    }


    function incrementStage (){
      console.log ('Incrementing step');
      console.log(config);

    }
    //carry out the first load
    window.s2 = S2Root.load();

});
