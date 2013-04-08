define(['text!testjson/unit/empty_search.json'], function (emptySearch) {
  'use strict';

  function cleanupCall(options) {
    // a blank options.url should default to '/'
    options.url = options.url.replace(/http:\/\/localhost:\d+/, '');
    if (options.url.length === 0) {
      options.url = '/';
      options.type = 'GET';
      options.data = null
    }
    if (options.method) {
      options.type = options.method
    }
    if (options.request) {
      if (!options.format || options.format !== "xml") {
        options.data = JSON.stringify(options.request);
      }
      else {
        options.data = options.request;
      }
    }
    options.type = options.type.toUpperCase();
    return options;
  }

  function callToString(options) {
    var output = options.type + ':' + options.url;
    if (options.data) {
      output = output + options.data;
    }
    return output;
  }

  function createSuccessfulResponse(call, response) {
    return {
      url:call.url,
      'status':200,
      responseTime:750,
      responseText:response
    };
  }

  var config = {
    apiUrl:'', // NOT USED IN TESTING
    logToConsole:true,
    logLevel:2, // 0..2 (0->everything, 2->only errors)
    printServiceUrl:'http://localhost:9292/services/print',
    printers:[
      {name:'Tube printer', type:2}
    ],

    loadTestData:function (testDataFile) {
      config.testData = undefined;
      config.hashedTestData = undefined;
      config.stage = 0;
      config.normalLoadingTestData(testDataFile);
      config.cummulativeLoadingTestDataInCurrentStage(emptySearch);
    },

    normalLoadingTestData:function (testDataFile) {
      if (!config.testData) {
        config.testData = [];
        config.testData.push({"calls":[]});
      }
      config.testData = $.parseJSON(testDataFile);
      config.transformTestDataIntoHashForStage(0);
    },

    cummulativeLoadingTestDataInCurrentStage:function (testDataFile) {
      if (!config.testData) {
        config.testData = [];
        config.testData.push({"calls":[]});
      }
      var extra = $.parseJSON(testDataFile)[0]["calls"];
      config.testData[0]["calls"] = config.testData[0]["calls"].concat(extra);
      config.transformTestDataIntoHashForStage(0);
    },

    transformTestDataIntoHashForCurrentStage:function () {
      if (config.stage != undefined) {
        config.transformTestDataIntoHashForStage(config.stage);
      }
    },

    transformTestDataIntoHashForStage:function (stage) {
      if (!config.hashedTestData) {
        config.hashedTestData = {};
      }
      _.each(config.testData[stage].calls, function (call) {
        var callKey = callToString(cleanupCall(call));
        config.hashedTestData[callKey] = call.response;
      });
    },

    progress:function () {
      if ((config.stage + 1) >= _.size(config.testData)) {
        config.stage = config.testData.length - 1;
        return;
      }
      config.stage++;
      config.log(1, " [!Progression!] -> ", config.stage);
      config.transformTestDataIntoHashForCurrentStage();
    },

    log:function (level) {
      if (!config.logToConsole) return; // do nothing

      if (arguments.length <= 0) return;

      if ((arguments.length == 1) || (typeof arguments[0] !== 'number' )) {
        console.log(level); // in this case, level is ... not a level
        return;
      }

      if (level < config.logLevel) return;

      var formats = [
        'background-color:darkgreen; color:white;',
        'background-color:darkblue; color:white;',
        'background-color:red; color:white;'
      ];
      var args = [];
      var str = '%c';
      for (var i = 0; i < arguments.length; i++) {
        if (i > 0) {
          args.push(arguments[i]);
          if (typeof arguments[i] === 'object') {
            str += ' %o';
          }
          else if (typeof arguments[i] === 'string') {
            str += ' %s';
          }
          else if (typeof arguments[i] === 'number') {
            if (arguments[i] === +arguments[i] && arguments[i] !== (arguments[i] | 0)) {
              str += ' %f';
            } else {
              str += ' %d';
            }
          }
        }
      }
      args.unshift(formats[level]);
      args.unshift(str);
      console.log.apply(console, args);
    },

    ajax:function (originalAjaxCall) {
      var fakeAjaxDeferred = $.Deferred();
      var ajaxCall = cleanupCall(originalAjaxCall);

      var key = callToString(ajaxCall);
      config.log(0, "Ajax call made... : ", key);
      var response = config.hashedTestData[key];
      if (response) {
        config.log(0, "   +--->     Found: ", response);
        if (ajaxCall.type === "PUT" || ajaxCall.type === "POST") {
          config.progress();
        }
        fakeAjaxDeferred.resolve(createSuccessfulResponse(ajaxCall, response));
      } else if (ajaxCall.type === 'POST' && ajaxCall.url === '/searches') {
        // if we are here, it means that there is no result on the server...
        // but the server should still respond with a search URI
        config.log(1, "   +---> Empty search result ");
        var keyForEmptySearchCall = "POST:/searches{\"search\":\"SEARCHING_FOR_SOMETHING_THAT_CAN'T_BE_FOUND\"}";
        fakeAjaxDeferred.resolve(createSuccessfulResponse(ajaxCall, config.hashedTestData[keyForEmptySearchCall]));
      }
      else {
        config.log(1, "   +---> NOT found");
        config.log(1, config.hashedTestData);
        fakeAjaxDeferred.reject();
      }
      return fakeAjaxDeferred;
    }
  };

  return config;
});

