define (['config', 'mapper/s2_resource', 'text!json/rna_manual_extraction.json', 'mapper/s2_ajax'], function (config, S2Resource, testJSON, S2Ajax) {
  'use strict';
  //load appropriate JSON for this workflow
  config.testJSON = $.parseJSON (testJSON);
  var s2ajax = new S2Ajax;
  //set up the tests with regard to the
  var jasmineTests;
  jasmineTests = {
    1:{
      1:function () {
        //create the S2.findByEan13Barcode to prevent page failing
        var S2Tube = {
          findByEan13Barcode:function (barcode) {
            return s2ajax.send ('read', '/searches', {data:barcode});
          }
        };
        return S2Tube.findByEan13Barcode ('XX333333K').done (function (returnedResource) {
          return returnedResource;
        })
      },
      2:function () {
        //this will obviously pass, we are returning the JSON it's checking against!!
        return config.testJSON[1].steps[2].response;
      }
    }
  };

  config.setTestJson('dna_only_extraction');

  var s2_ajax = new S2Ajax();


  describe('Mocked s2_ajax object', function(){
    config.currentStage = 'stage1';
    var tube;
    s2_ajax.send(
        'read',
        '/11111111-2222-3333-4444-555555555555').
          done(function(response){
          tube = response.responseText;
        });

    it('returns an S2Resource object', function(){
      expect(tube).toBeDefined();
    });

    it('matches data directly from JSON file', function(){
      // send uuid or barcode to grab resources
      expect(tube).toEqual(config.getTestJson()["/11111111-2222-3333-4444-555555555555"]);
    });

  });

  describe('S2 Root', function(){
    config.currentStage = 'stage1';

    // We can only access the response object through a side effect.
    var s2root;

    s2_ajax.send('read').done(function(response){
      s2root = response.responseText;
    });

    it('returns an object', function(){
      expect(s2root).toBeDefined();
    });

    it('returns an object containing searches', function(){
      expect(s2root.searches).toBeDefined();

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
