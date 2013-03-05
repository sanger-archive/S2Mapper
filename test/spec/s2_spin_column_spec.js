define(['config','json/dna_only_extraction', 'mapper/s2_resource_factory'], function(config, testJSON, ResourceFactory){
  'use strict';

  config.testJSON = testJSON;
  describe('S2 Spin Column',function(){
    config.currentStage = 'stage2';

    var rawJSON = config.getTestJson()['/22222222-2222-3333-4444-555555555555'];

    var s2_spinColumn;

    var resourcePromise = new ResourceFactory('22222222-2222-3333-4444-555555555555');

    // .done() sets a spin column through a side effect
    resourcePromise.done(function(s2spinColumn){ s2_spinColumn = s2spinColumn; });

    it('has a rawJson attribute that matches the JSON returned by S2.',function(){
      expect(s2_spinColumn.rawJson).toBe(rawJSON);
    });

    for (var action in rawJSON.spin_column.actions){
      it('has a '+action+' action method matching the raw JSON action attribute.', function(){
        expect(s2_spinColumn[action]).toBeDefined();
      });
    }

    it("has a resourceType attribute of 'spin_column'", function(){
      expect(s2_spinColumn.resourceType).toBe('spin_column');
    });

  });
});
