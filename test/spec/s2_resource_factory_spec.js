define(['config', 'mapper/s2_resource_factory'],function(config, ResourceFactory){
  'use strict';

  // We use an empty object for test results so that we can use a
  // string as a pointer to a returned value.
  var results;

  function assignResultTo(target){
    return function(source){
      // Assignment through side effect; simultates callback.
      results[target] = source;
    }
  }

  config.setTestJson('dna_only_extraction');

  describe('ResourceFactory:-', function(){
    describe('Mapping a tube,', function(){
      results = {};
      var rawTubeJSON     = config.getTestJson('/11111111-2222-3333-4444-555555555555');
      var resourcePromise = new ResourceFactory({uuid: '11111111-2222-3333-4444-555555555555' });
      resourcePromise.done(assignResultTo('tube'));


      it('has a rawJson attribute that matches the JSON returned by S2.',function(){
        expect(results.tube.rawJson).toBe(rawTubeJSON);
      });

      for (var action in rawTubeJSON.tube.actions){
        it('has a '+action+' action method matching the raw JSON action attribute.', function(){
          expect(results.tube[action]).toBeDefined();
        });
      }


    });

    describe("Mapping an order,",function(){
      beforeEach(function(){
        config.currentStage = 'stage1';
        (new ResourceFactory({uuid: "11111111-2222-3333-4444-999999999999"})).done(assignResultTo('order'));
      });

      it("makes OrderResources when the resource is an order.",function(){
        // expect(results.tube instanceof TubeLikeResource).toBe(true);
        expect(results.order).toBeDefined();
      });

    });

  });

});
