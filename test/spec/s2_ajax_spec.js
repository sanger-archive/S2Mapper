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

  //append the tests that should return the correct data at each stage/step
  $.each (config.testJSON, function (stageno, stage) {
    if (jasmineTests[stageno]) {
      describe (stage.description, function () {
        $.each (stage.steps, function (stepno, step) {
          if (jasmineTests[stageno][stepno]) {
            var actual = jasmineTests[stageno][stepno] (),
              expected = config.testJSON[stageno].steps[stepno].response;
            it ('Matches stage ' + stageno + ', step ' + stepno + ' of JSON file', function () {
              expect (expected).toEqual (actual);
            });
          }
        })
      });
    }
  })
});
