define(['text!/json/dna_and_rna_manual_extraction.json',
       'json/dna_only_extraction'
], function(dnaRnaJson, dnaJson) {
  'use strict';

  var dnaRnaJson = $.parseJSON(dnaRnaJson);
  console.log(dnaRnaJson)
  var config = {
    apiUrl:'', // NOT USED IN TESTING
    testDataJson : dnaRnaJson,
    currentStage: '1',
    setupTest: function (stage,step){
      var actionMethods = {
        post: 'search' // This a POST because we are creating a search object
//        first: 'GET',
//        create:'POST',
//        read:  'GET', // Read maps to GET
//        last:  'GET',
//        update:'PUT', // Update maps to PUT
//        'delete':'DELETE', // Update maps to PUT
      };
      var stepStage = config.testDataJson[stage].steps[step]





      config.method = actionMethods[ stepStage.method.toLowerCase() ];
      config.url = stepStage.url;
      config.params = stepStage.request;
      config.expectedResponse = JSON.stringify(config.testDataJson[stage].steps[step].response);

    },

    finalDna: {},
    createTestData: function(){
      for (var stage in dnaRnaJson) {
        for(var stepNo in dnaRnaJson[stage].steps) {
          var step = dnaRnaJson[stage].steps[stepNo]
          config.finalDna[step.url + step.method + JSON.stringify(step.request)] = step.response;

        }
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
      console.log('Sending ajax message:-');

      var reqParams = options.url + options.type.toLowerCase() + JSON.stringify(options.data)
      console.log(reqParams)




      // We resolve the Deferred object before return so any callbacks added
      // with .done() are called as soon as they're added, which should solve 
      // testing latency issues.

      var response = config.finalDna[reqParams];
      console.log('Responding with:-');
      console.log(response);



      return $.Deferred().resolve({
        url:           options.url,
        'status':      200,
        responseTime:  750,
        responseText:  JSON.stringify(response)
      });
    }
  };
  config.createTestData();
//  console.log(config.finalDna);
  return config;
});

