define (['config',
        'mapper/s2_ajax',
        'text!json/unit/ajax.json'
], function (config, S2Ajax, ajaxTestJson) {
  'use strict';
  //load appropriate JSON for this workflow
  // config.testJSON = $.parseJSON (testJSON);
  var s2ajax = new S2Ajax;
  var getActionMethod = function(stepStage){

    if (stepStage.response === "search"){
      if (stepStage.method === "post"){
        return 'search';
      }
      if(stepStage.url.match(/page\=1/)){
        return "first";
      }
      if(stepStage.url.match(/page\=\-1/)){
        return "last";
      }

    } else {
      var actionMethods = {
        post:'create',
        get:  'read', // Read maps to GET
        put:'update', // Update maps to PUT
        'delete':'delete' // Update maps to PUT
      };
      return actionMethods[stepStage.method.toLowerCase()];
    }
  }



  describe("S2Ajax:-", function(){

    describe('Mocked s2ajax object (used for testing only),', function(){
      var search, expectedResponse;

      beforeEach(function(){
        //pass stage, step to config.setupTest
        expectedResponse = config.setupTest(ajaxTestJson);
        config.method = getActionMethod(config.stepStage);


        s2ajax.send(
          config.method,
          config.url,
          config.params
        ).done(function(response){
          search = response.responseText;
        });

      });

      it('matches data directly from JSON file', function(){
        // send uuid or barcode to grab resources
        expect(search).toEqual(expectedResponse);
      });

    });

    describe("Loading S2's Root,", function(){

      // We can only access the response object through a side effect.
      var s2root, expectedResponse;
      beforeEach(function(){
        expectedResponse = config.setupTest(ajaxTestJson);

        s2ajax.send(
          config.method,
          config.url,
          config.params
        ).done(function(response){
          s2root = response.responseText;
        });
      });


      it('returns an object', function(){
        expect(s2root).toBeDefined();
      });

      it('returns an object containing searches', function(){

        expect(s2root.searches).toBeDefined();

      });
    });

  });


});
