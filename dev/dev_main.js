//This file is part of S2 and is distributed under the terms of GNU General Public License version 1 or later;
//Please refer to the LICENSE and README files for information on licensing and authorship of this file.
//Copyright (C) 2013 Genome Research Ltd.
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


      var response = config.stepJson[config.reqParams];
      if (response === undefined) {
        console.log("AJAX[" + config.reqParams + "]: not found in " + JSON.stringify(config.stepJson));
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

    //populate the pipeline and stepJson
    for (var stageNum in json){
      for  (var stepNum in json[stageNum].steps) {
        var step = json[stageNum].steps[stepNum];
        config.stepJson[step.url + step.method + JSON.stringify(step.request)] = step.response;
        config.steps.push(step.description);
      }
    }
    //carry out the first load
    window.s2 = S2Root.load();

});
