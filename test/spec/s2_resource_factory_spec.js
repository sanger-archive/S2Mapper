define([
    'config',
    'mapper/s2_resource_factory',
    'text!json/tube_data_1.json',
    'text!json/dna_and_rna_manual_extraction.json'],
    function(config, ResourceFactory, testJSON_stage1, dnaJSON){
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

  //config.setTestJson('dna_only_extraction');

  describe('ResourceFactory:-', function(){
    describe('Mapping a tube,', function(){
      results = {};
      var expectedResponse = config.setupTest(testJSON_stage1,0);
      var resourcePromise = new ResourceFactory({uuid: '3bcf8010-68ac-0130-9163-282066132de2' });
      resourcePromise.done(assignResultTo('tube'));

      it('has a rawJson attribute that matches the JSON returned by S2.',function(){

        expect(results.tube.rawJson).toBe(expectedResponse);
      });

      for (var action in expectedResponse.tube.actions){
        it('has a '+action+' action method matching the raw JSON action attribute.', function(){
          expect(results.tube[action]).toBeDefined();
        });
      }


    });

    describe("Mapping an order,",function(){
      beforeEach(function(){
        var expectedResponse = config.setupTest(testJSON_stage1,1);
        console.log(expectedResponse)
        new ResourceFactory({uuid: "25ec5e30-67b1-0130-915d-282066132de2"}).done(assignResultTo('order'))
      });

      it("makes OrderResources when the resource is an order.",function(){
        expect(results.order).toBeDefined();
      });

    });

  });

});
