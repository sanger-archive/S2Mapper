require(['scripts/s2_tube', 'json/dna_only_extraction'],function(S2Tube, testJSON){
  'use strict';

  config.testJSON = testJSON.stage1;

  describe('S2 Tube', function(){
    var tube = new S2Tube('11111111-2222-3333-4444-555555555555');

    it('has a rawJson attribute', function(){
      expect(tube.rawJson).toBeDefined();
    });

    it('rawJson matches the JSON returned by S2',function(){
    });

  });

});
