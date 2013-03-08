define(['config','text!json/spin_column_data_1.json', 'mapper/s2_resource_factory'], function(config, testJSON, ResourceFactory){
  'use strict';
  var expectedResponse = config.setupTest(testJSON,0);
  describe('S2 Spin Column',function(){
    beforeEach(function(){
      var rawJSON = config.stepStage.response;

      var s2_spinColumn;

      var resourcePromise = new ResourceFactory('');

      // .done() sets a spin column through a side effect
      resourcePromise.done(function(s2spinColumn){ s2_spinColumn = s2spinColumn; });

    });




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
