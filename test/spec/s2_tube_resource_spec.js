define([
       'config',
       'mapper/s2_resource_factory',
       'mapper/s2_root',
       'text!json/unit/root_data.json',
       'text!json/unit/tube_data.json'
], function(config, ResourceFactory, Root, rootTestJson, tubeTestJson){
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
        config.setupTest(rootTestJson, 0);
        Root.load().done(assignResultTo('root'));

        s2 = results.root;
        config.setupTest(tubeTestJson, 2);
        s2.tubes.findByEan13Barcode('2345678901234').done(assignResultTo('tube'));
      });


      it("takes an EAN13 barcode and returns the corresponding resource.", function(){
        expect(results.tube.rawJson).toBeDefined();
      });
    });

    describe("Finding an order from a tube,", function(){
      beforeEach(function(){
        config.setupTest(rootTestJson, 0);
        results = {};
        Root.load().done(assignResultTo('root'));
        s2 = results.root;

        config.setupTest(tubeTestJson, 1);
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


    // This batch behaviour should move to a module to be shared by other item
    // type resources such as spin column and plate.
    xdescribe("calling .batch() on a tube,", function(){

      describe("when the tube is not in a batch", function(){
        beforeEach(function(){
          config.setupTest(tubeTestJson, 0);
          new ResourceFactory({uuid: '3bcf8010-68ac-0130-9163-282066132de2' }).done(assignResultTo('tube'));
          debugger;
          results.tube.batch().done(assignResultTo('batch'));
        });

        it("returns null.", function(){
          expect(results.batch).toBe(null);
        });
      });

      describe("when the tube is in a batch,",function(){
        beforeEach(function(){
          config.setupTest(tubeTestJson, 0);
          new ResourceFactory({uuid: '3bcf8010-68ac-0130-9163-282066132de2'}).done(assignResultTo('tube'));
          results.tube.batch().done(assignResultTo('batch'));
        });

        it("returns a batchPromise which resolves with a batch.", function(){
          expect(results.batch).toBeDefined();
        });

      });


    });

  });
});
