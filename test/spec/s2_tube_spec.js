require(['config', 'mapper/s2_tube', 'json/dna_only_extraction'],function(config,S2Tube, testJSON){
  'use strict';

  config.testJSON = testJSON.stage1;

  describe('S2 Tube', function(){
    var rawTubeJSON = config.testJSON['/11111111-2222-3333-4444-555555555555'];

    var s2_tube;

    var tubePromise = new S2Tube('11111111-2222-3333-4444-555555555555');

    // .done() sets a tube through a side effect
    tubePromise.done(function(s2tube){ s2_tube = s2tube; });

    it('has a rawJson attribute that matches the JSON returned by S2.',function(){
      expect(s2_tube.rawJson).toBe(rawTubeJSON);
    });

    for (var action in rawTubeJSON.tube.actions){
      it('has a '+action+' action method matching the raw JSON action attribute.', function(){
        expect(s2_tube[action]).toBeDefined();
      });
    }

    it("has a resourceType attribute of 'tube'", function(){
      expect(s2_tube.resourceType).toBe('tube');
    });

  });
});
