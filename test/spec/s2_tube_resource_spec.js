define([
       'config',
       'mapper/s2_resource_factory',
       'mapper/s2_root',
       'text!json/unit/root.json',
       'text!json/unit/tube.json',
       'text!json/unit/tube_by_barcode.json'
], function(config, ResourceFactory, Root, rootTestJson, tubeTestJson, tubeByBarcodeJson){
  'use strict';

  // We use an empty object for test results so that we can use a
  // string as a pointer to a returned value.
  var results = {};

  function assignResultTo(target){
    return function(source){ 
      // Assignment through side effect; simultates callback.
      results[target] = source;
    }
  }


  describe("Tube Resource:-",function(){
    var s2;

    describe("Searcing for a tube by EAN13 barcode,", function(){

      beforeEach(function(){
        config.setupTest(rootTestJson);
        Root.load().done(assignResultTo('root'));

        s2 = results.root;
        config.setupTest(tubeByBarcodeJson);
        s2.tubes.findByEan13Barcode('2345678901234').done(assignResultTo('tube'));
      });


      it("takes an EAN13 barcode and returns the corresponding resource.", function(){
        expect(results.tube.rawJson).toBeDefined();
      });
    });

    describe("Finding an order from a tube,", function(){
      beforeEach(function(){
        config.setupTest(rootTestJson);
        results = {};
        Root.load().done(assignResultTo('root'));
        s2 = results.root;

        config.setupTest(tubeByBarcodeJson);
        s2.tubes.findByEan13Barcode('2345678901234').done(assignResultTo('tube'));
      });

      it("is carried out by callind .order() on a Tube.", function(){
        expect(typeof results.tube.order).toBe('function');
      });

      it("returns an OrderResourcePromise when .order() is called on a Tube.", function(){
        expect(results.tube.order().done).toBeDefined();
      });

      it("resolves to an order resource.",function(){
        results.tube.order().done(assignResultTo('order'));
        expect(results.order.resourceType).toBe('order');
      });

    });





  });
});
