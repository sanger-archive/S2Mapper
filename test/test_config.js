define(['text!json/unit/empty_tube_search.json'], function (emptyTubeData) {
  'use strict';

  var log = "";

  var config = {
    apiUrl:   '', // NOT USED IN TESTING
    setupTest:function (testData, stepNo) {
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

    stepJson:{},

    createTestData:function (testData) {
      var output = '';
      for (var stepNo in testData.steps) {
        var step = testData.steps[stepNo];
        step.method = step.method.toUpperCase();
        output += '<br/>Step' + stepNo + ':' + step.description + '. Needs a ' + step.method + '. Responds with ' +
            Object.keys(step.response)[0];

        var key = step.method + ':' + step.url;
        if (step.request) {
          var extension;
          switch (step.format) {
            case 'xml':
              extension = step.request;
              break;
            default:
              extension = JSON.stringify(step.request);
              break;
          }
          key = key + extension;
        }
        config.stepJson[key] = step.response;
      }
    },

    setTestJson:function (workflow) {
      // Fixme Not working ideally yet still having to require
      // the package on module load.
      config.testJSON = require('json/' + workflow);
    },

    getTestJson:function (url) {
      var path = url.replace(/^http:\/\/\w*:?\d*\//, '/');
      var resultFromJson = config.testJSON[config.currentStage][path];

      if (resultFromJson === undefined) {
        throw "Path: '" + path + "' not found in test JSON for stage: "
            + config.currentStage;
      }

      return resultFromJson;
    },

    logToConsole:true,

    log: function (message, level) {
      if (!config.logToConsole) return; // do nothing

      var formats = [
        'background-color:darkgreen; color:white;',
        'background-color:darkblue; color:white;',
        'background-color:red; color:white;'
      ];

      if (typeof message === 'object') {
        console.log(message);
      }
      else {
        console.log('%c' + message, formats[level]);
      }

    },

    // Dummy out the ajax call returned by S2Ajax to test from file.
    // Returns a Deferred instead of jqXHR.
    ajax:function (options) {
      var fakeAjaxDeferred = $.Deferred();

      // a blank options.url should default to '/'
      options.url = options.url.replace(/http:\/\/localhost:\d+/, '');

      if (options.url.length === 0) {
        options.url = '/'
        options.type = 'GET'
        options.data = null
      }

      options.type = options.type.toUpperCase();

      config.reqParams = options.type + ':' + options.url;
      if (options.data) {
        config.reqParams = config.reqParams + options.data;
      }
      config.log(config.reqParams, 1);

      config.log('Sending ajax message for "' + config.stage + '"');
      var response = config.stepJson[config.reqParams];
      if (response !== undefined) {
        config.log("Responding with:", 0);
        config.log(response);

        fakeAjaxDeferred.resolve({
          url:         options.url,
          'status':    200,
          responseTime:750,
          responseText:response
        });

      } else if (options.type === 'POST' && options.url === '/searches') {
        config.log('\nSearch for: ' + JSON.parse(options.data).search.model
            + ' not found in test data.', 2);

        config.log('\nSimulating search not found on S2...');
        config.log('Returning: ' + options.url, 0);

        fakeAjaxDeferred.resolve({
          url:         options.url,
          'status':    200,
          responseTime:750,
          responseText:JSON.parse(emptyTubeData).steps[0].response
        });
      } else if (options.type === 'GET' && options.url === '/EMPTY_SEARCH_RESULT_UUID/page=1') {
        config.log('\nSimulating empty search result search page...');
        config.log('Returning: ' + options.url, 0);

        fakeAjaxDeferred.resolve({
          url:         options.url,
          'status':    200,
          responseTime:750,
          responseText:JSON.parse(emptyTubeData).steps[1].response
        });

      } else {
        config.log('\nRequest for: ' + config.reqParams + ' not found in test data.', 2);
        config.log('Simulating a 404 error!', 2);
        fakeAjaxDeferred.reject(fakeAjaxDeferred, '404 error');
      }

      config.log('_________________________________________________________\n');
      return fakeAjaxDeferred;
    },

    printServiceUrl:'http://localhost:9292/services/print',
    printers:       [
      {name:'Tube printer', type:2}
    ]
  };

  return config;
});

