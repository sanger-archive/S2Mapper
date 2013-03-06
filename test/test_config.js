define([], function() {
  'use strict';


  var config = {
    apiUrl:'', // NOT USED IN TESTING
    currentStage: '1',
    setupTest: function (testData,stage,step){
      testData = $.parseJSON(testData);

      config.createTestData(testData);

      var actionMethods = {
        post: 'search' // This a POST because we are creating a search object
//        first: 'GET',
//        create:'POST',
//        read:  'GET', // Read maps to GET
//        last:  'GET',
//        update:'PUT', // Update maps to PUT
//        'delete':'DELETE', // Update maps to PUT
      };
      var stepStage = testData[stage].steps[step];
      config.stage = stepStage.description || "No description in JSON"


      config.method = actionMethods[ stepStage.method.toLowerCase() ];
      config.url = stepStage.url;
      config.params = stepStage.request;
      return testData[stage].steps[step].response;

    },

    finalDna: {},
    createTestData: function(testData){
      var output = '';

      for (var stage in testData) {
        output += '<br/>Stage ' + stage + ':' + testData[stage].stage
        for(var stepNo in testData[stage].steps) {
          var step = testData[stage].steps[stepNo]
          output += '<br/>Step' + stepNo + ':' + step.description +'. Needs a ' + step.method + '. Responds with ' +
            Object.keys(step.response)[0]


          config.finalDna[step.url + step.method + JSON.stringify(step.request)] = step.response;

        }
      }
//      $('body').prepend(output)

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


      //var response = config.finalDna[url + options.type + JSON.stringify(options.data)];


      return resultFromJson;
    },

    cpResource: function (original_uuid, new_uuid) {
      var resourceJsonClone = JSON.parse (JSON.stringify (
        config.getTestJson ()["/" + original_uuid]));
        resourceJsonClone.uuid = new_uuid;
        config.getTestJson ()["/" + new_uuid] = resourceJsonClone;
    },

    // Dummy out the ajax call returned by S2Ajax to test from file.
    // Returns a Deferred instead of jqXHR.
    ajax: function (options){
      var requestOptions = options;
/*
      // a blank options.url should default to '/'
      if (options.url.length === 0){
        requestOptions.url = '/';
      }  else {
        requestOptions.url = options.url;
      }

      if (options.type === 'POST') requestOptions.url = options.url+'/'+JSON.stringify(options.data);
 var responseText = config.getTestJson(requestOptions.url);
*/
      console.log('Sending ajax message for ' + config.stage);
//      debugger;
      var reqParams = options.url + options.type.toLowerCase() + JSON.stringify(options.data)
      console.log(reqParams)




      // We resolve the Deferred object before return so any callbacks added
      // with .done() are called as soon as they're added, which should solve 
      // testing latency issues.

      var response = config.finalDna[reqParams];
      console.log('Responding with a ' + typeof response);
      console.log(response);



      return $.Deferred().resolve({
        url:           options.url,
        'status':      200,
        responseTime:  750,
        responseText:  response
      });
    }
  };
//  console.log(config.finalDna);
  return config;
});

