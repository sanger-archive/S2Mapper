define (['config',
  'mapper/s2_ajax',
  'text!json/dna_and_rna_manual_extraction_1.json',
  'text!json/root_data_1.json'
], function (config, S2Ajax, testJSON_stage1, rootData_stage1) {
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


  //set up the tests with regard to the
  // var jasmineTests;
  // jasmineTests = {
  //   1:{
  //     1:function () {
  //       //create the S2.findByEan13Barcode to prevent page failing
  //       var S2Tube = {
  //         findByEan13Barcode:function (barcode) {
  //           return s2ajax.send ('read', '/searches', {data:barcode});
  //         }
  //       };
  //       return S2Tube.findByEan13Barcode ('XX333333K').done (function (returnedResource) {
  //         return returnedResource;
  //       })
  //     },
  //     2:function () {
  //       //this will obviously pass, we are returning the JSON it's checking against!!
  //       return config.testJSON[1].steps[2].response;
  //     }
  //   }
  // };

  describe("S2Ajax:-", function(){

    describe('Mocked s2ajax object (used for testing only),', function(){
      var search, expectedResponse;

      beforeEach(function(){
        //pass stage, step to config.setupTest
        expectedResponse = config.setupTest(testJSON_stage1,0);
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
        expectedResponse = config.setupTest(testJSON_stage1,0);

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


  // *** Marked as WIP.  Probably moved out to another file ***
  //
  // //append the tests that should return the correct data at each stage/step
  // $.each (config.testJSON, function (stageno, stage) {
  //   if (jasmineTests[stageno]) {
  //     describe (stage.description, function () {
  //       $.each (stage.steps, function (stepno, step) {
  //         if (jasmineTests[stageno][stepno]) {
  //           var actual = jasmineTests[stageno][stepno] (),
  //             expected = config.testJSON[stageno].steps[stepno].response;
  //           it ('Matches stage ' + stageno + ', step ' + stepno + ' of JSON file', function () {
  //             expect (expected).toEqual (actual);
  //           });
  //         }
  //       })
  //     });
  //   }
  // })
});
