require(['config', 'mapper/s2_tube', 'json/dna_only_extraction'],function(config,S2Tube, testJSON){
  'use strict';

  config.testJSON = testJSON.stage1;

  describe('S2 Tube', function(){
    var tube = {};

    var rawTube = config.testJSON['/tubes/11111111-2222-3333-4444-555555555555']

    var dummyResponse = {
      responseText: rawTube
    };

    var tubeCallback = new S2Tube(tube);

    tubeCallback(dummyResponse);

    it('has a rawJson attribute', function(){
      expect(tube.rawJson).toBeDefined();
    });

    it('rawJson matches the JSON returned by S2',function(){
      expect(tube.rawJson).toBe(rawTube);
    });

  });

});
