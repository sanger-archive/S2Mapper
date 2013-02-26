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

  describe('S2 Resource mapping a tube:-', function(){
      results = {};

      config.currentStage = 'stage1';
      var rawTubeJSON     = config.getTestJson()['/11111111-2222-3333-4444-555555555555'];
      var resourcePromise = new S2Resource('11111111-2222-3333-4444-555555555555');
      resourcePromise.done(assignResultTo('tube'));


    it('has a rawJson attribute that matches the JSON returned by S2.',function(){
      expect(results.tube.rawJson).toBe(rawTubeJSON);
    });

    for (var action in rawTubeJSON.tube.actions){
      it('has a '+action+' action method matching the raw JSON action attribute.', function(){
        expect(results.tube[action]).toBeDefined();
      });
    }

    it("has a resourceType attribute of 'tube'", function(){
      expect(results.tube.resourceType).toBe('tube');
    });

    describe("the exceptions it can throw:-", function() {
      function loadingABadTube () {
        config.currentStage = 'badResources';
        var tubePromise     = new S2Resource('11111111-2222-3333-4444-555555555555');
      }

      it("throws if the resources UUID doesn't match for all of the resource's action uuids", function() {
        expect(loadingABadTube).toThrow({
          name:     'Resource Validaion',
          message:  "Resource UUIDs don't match up."
        });
      })
    });

    // it("returns it's current batch when .batch() is called", function(){
    //   expect(results.tube.getBatch()).toBeDefined();
    // });
  });

  describe("S2Resource mapping a order",function(){
    beforeEach(function(){
      config.currentStage = 'stage1';
      (new S2Resource("11111111-2222-3333-4444-999999999999")).done(assignResultTo('order'));
    });

    it("makes OrderResources when the resource is an order",function(){
      // expect(results.tube instanceof TubeLikeResource).toBe(true);
      expect(results.order).toBeDefined();
    });

  });

  describe("Searcing for a Resource by EAN13 barcode", function(){
    it("Takes an EAN13 barcode and returns the corresponding resource", function(){
      // expect(typeof S2 Resource.findByEan13Barcode('2345678901234')).toBe('tube');
    });
  });

});
