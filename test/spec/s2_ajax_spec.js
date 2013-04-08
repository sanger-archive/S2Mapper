define(['config',
  'mapper/s2_ajax',
  'text!json/unit/ajax.json'
], function (config, S2Ajax, ajaxTestJson) {
  'use strict';
  //load appropriate JSON for this workflow
  // config.testJSON = $.parseJSON (testJSON);
  var s2ajax = new S2Ajax;
  var getActionMethod = function (call) {

    if (call.response === "search") {
      if (call.method === "post") {
        return 'search';
      } else if (call.url.match(/page\=1/)) {
        return "first";
      }
      return "last";
    } else {
      var actionMethods = {
        post:'create',
        get:'read', // Read maps to GET
        put:'update', // Update maps to PUT
        'delete':'delete' // Update maps to PUT
      };
      return actionMethods[call.method.toLowerCase()];
    }
  };

  describe("S2Ajax:-", function () {

    describe('Mocked s2ajax object (used for testing only),', function () {
      var search, expectedResponse;

      beforeEach(function () {
        //pass stage, step to config.setupTest
        config.loadTestData(ajaxTestJson);
        expectedResponse = config.testData[config.defaultStage]["calls"][0].response;
        config.method = getActionMethod(config.testData[config.defaultStage]["calls"][0]);
        config.url = config.testData[config.defaultStage]["calls"][0].url;
        config.params = config.testData[config.defaultStage]["calls"][0].request;

        s2ajax.send(
            config.method,
            config.url,
            config.params
        ).done(function (response) {
              search = response.responseText;
            });
      });

      it('matches data directly from JSON file', function () {
        // send uuid or barcode to grab resources
        expect(search).toEqual(expectedResponse);
      });
    });

    describe("Loading S2's Root,", function () {

      // We can only access the response object through a side effect.
      var s2root, expectedResponse;
      beforeEach(function () {
        config.loadTestData(ajaxTestJson);
        expectedResponse = config.testData[config.defaultStage]["calls"][0].response;
        config.method = getActionMethod(config.testData[config.defaultStage]["calls"][0]);
        config.url = config.testData[config.defaultStage]["calls"][0].url;
        config.params = config.testData[config.defaultStage]["calls"][0].request;

        s2ajax.send(
            config.method,
            config.url,
            config.params
        ).done(function (response) {
              s2root = response.responseText;
            });
      });

      it('returns an object', function () {
        expect(s2root).toBeDefined();
      });

      it('returns an object containing searches', function () {
        expect(s2root.searches).toBeDefined();
      });
    });

  });

});
