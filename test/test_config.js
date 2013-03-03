define([
       'json/dna_only_extraction'
], function(dnaJson) {
  'use strict';

  var config = {
    apiUrl:'', // NOT USED IN TESTING

    currentStage: 'stage1',

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

    cpResource: function (original_uuid, new_uuid) {
      var resourceJsonClone = JSON.parse (JSON.stringify (
        config.getTestJson ()["/" + original_uuid]));
        resourceJsonClone.uuid = new_uuid;
        config.getTestJson ()["/" + new_uuid] = resourceJsonClone;
    },

    // Dummy out the ajax call returned by S2Ajax to test from file.
    // Returns a Deferred instead of jqXHR.
    ajax: function (options){
      var requestOptions = $.extend ({
        // data:{ uuid: undefined }
      }, options);

      // a blank options.url should default to '/'
      if (options.url.length === 0) requestOptions.url = '/';

      console.log('Sending ajax message:-');
      console.log(requestOptions);

      var responseText = config.getTestJson(requestOptions.url);

      console.log('Responding with:-');
      console.log(responseText);

      // We resolve the Deferred object before return so any callbacks added
      // with .done() are called as soon as they're added, which should solve 
      // testing latency issues.
      return $.Deferred().resolve({
        url:           '/something/other',
        'status':      200,
        responseTime:  750,
        responseText:  responseText
      });
    }
  };

  return config;
});
