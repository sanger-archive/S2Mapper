// TODO[sd9] Rename this to s2_resource_factory.
// Rename needs to be coordinated with pipeline applications.
define(['config', 'mapper/s2_resource'],function(config, S2Resource){
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

  describe('S2Resource:-', function(){
    describe('Mapping a tube,', function(){
      results = {};

      config.currentStage = 'stage1';
      var rawTubeJSON     = config.getTestJson('/11111111-2222-3333-4444-555555555555');
      var resourcePromise = new S2Resource({uuid: '11111111-2222-3333-4444-555555555555' });
      resourcePromise.done(assignResultTo('tube'));


      it('has a rawJson attribute that matches the JSON returned by S2.',function(){
        expect(results.tube.rawJson).toBe(rawTubeJSON);
      });

      for (var action in rawTubeJSON.tube.actions){
        it('has a '+action+' action method matching the raw JSON action attribute.', function(){
          expect(results.tube[action]).toBeDefined();
        });
      }

      xdescribe("the exceptions it can throw:-", function() {
        function loadingABadTube () {
          config.currentStage = 'badResources';
          var tubePromise     = new S2Resource({uuid: '11111111-2222-3333-4444-555555555555'});
        }

        it("throws if the resources UUID doesn't match for all of the resource's action uuids.", function() {
          expect(loadingABadTube).toThrow({
            name:     "Resource Validaion",
            message:  "Resource UUIDs don't match up."
          });
        })
      });

    });

    describe("Mapping an order,",function(){
      beforeEach(function(){
        config.currentStage = 'stage1';
        (new S2Resource({uuid: "11111111-2222-3333-4444-999999999999"})).done(assignResultTo('order'));
      });

      it("makes OrderResources when the resource is an order.",function(){
        // expect(results.tube instanceof TubeLikeResource).toBe(true);
        expect(results.order).toBeDefined();
      });

    });

  });

});
