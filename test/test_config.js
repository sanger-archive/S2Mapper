define(['text!json/unit/empty_tube_search.json'], function(emptyTubeData) {
  'use strict';

  var log = "";

  var config = {
    apiUrl:'', // NOT USED IN TESTING
    setupTest: function (testData, stepNo){
      var step = stepNo || 0;

      testData = $.parseJSON(testData);
      config.createTestData(testData);

      var stepStage = testData.steps[step];
      config.stepStage = stepStage;
      config.stage = stepStage.description || "No description in JSON";

      config.url = stepStage.url;
      config.params = stepStage.request;
      return testData.steps[step].response;

    },

    stepJson: {},

    createTestData: function(testData){
      var output = '';
      for(var stepNo in testData.steps) {
        var step = testData.steps[stepNo]
        output += '<br/>Step' + stepNo + ':' + step.description +'. Needs a ' + step.method + '. Responds with ' +
          Object.keys(step.response)[0];

        var key = step.url + step.method;
        if (step.request) {
          var extension;
          switch(step.format) {
            case 'xml': extension = step.request;                 break;
            default:    extension = JSON.stringify(step.request); break;
          }
          key = key + extension;
        }
        config.stepJson[key] = step.response;
      }
    },

    setTestJson: function(workflow){
      // Fixme Not working ideally yet still having to require
      // the package on module load.
      config.testJSON = require('json/'+workflow);
    },

    getTestJson: function(url){
      var path           = url.replace(/^http:\/\/\w*:?\d*\//,'/');
      var resultFromJson = config.testJSON[config.currentStage][path];

      if (resultFromJson === undefined)
        throw "Path: '"+path+"' not found in test JSON for stage: "
      +config.currentStage;

      return resultFromJson;
    },

    log: function(message){
      if (message) log = log + "\n"+ message;

      return log;
    },

    // Dummy out the ajax call returned by S2Ajax to test from file.
    // Returns a Deferred instead of jqXHR.
    ajax: function (options){
      // a blank options.url should default to '/'
      options.url = options.url.replace(/http:\/\/localhost:\d+/,'');

      if (options.url.length === 0){
        options.url  = '/'
        options.type = 'get'
        options.data = null
      }

      config.log('------------------------');
      config.log('Sending ajax message for ' + config.stage);

      config.reqParams = options.url + options.type.toLowerCase();
      if (options.data) { config.reqParams = config.reqParams + options.data; }
      config.log(config.reqParams);


      // The real $.ajax returns a promise.  Please leave this as a defered as
      // it lets us spy on reject and resolve.
      var fakeAjaxDeferred = $.Deferred();

      // We resolve the Deferred object before return so any callbacks added
      // with .done() are called as soon as they're added, which should solve
      // testing latency issues.

      var response = config.stepJson[config.reqParams];
      if (response === undefined) {
        // if the stored result can't be found in the data but the url is in the root then
        // it means that the system couldn't find the data.

        config.log("AJAX[" + config.reqParams + "]: not found in " + config.stepJson);
          // Check whether this is a search we need to fake.
        if (options.url === '/searches' && options.type.toLowerCase() === 'post') {
          config.log('But we are searching for a ' + options.data.search.model  + ', so need to return the empty data');

          fakeAjaxDeferred.resolve({
            url:           options.url,
            'status':      200,
            responseTime:  750,
            responseText:  JSON.parse(emptyTubeData).steps[0].response
          });

        } else {

          fakeAjaxDeferred.reject(fakeAjaxDeferred, '404 error');
        }
      } else {
        config.log("AJAX[" + config.reqParams + "]: responding with:");
        config.log(response);

        fakeAjaxDeferred.resolve({
          url:           options.url,
          'status':      200,
          responseTime:  750,
          responseText:  response
        });

      }
      return fakeAjaxDeferred;
    },

    printServiceUrl: 'http://localhost:9292/services/print',
    printers: [ {name: 'Tube printer', type: 2} ]
  };
  return config;
});

