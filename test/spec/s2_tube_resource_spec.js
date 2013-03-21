define([ 'resource_test_helper'
       , 'config'
       , 'mapper/s2_root'
       , 'mapper/s2_tube_resource'
       , 'text!json/unit/root.json'
       , 'text!json/unit/tube.json'
       , 'text!json/unit/order_without_batch.json'
], function(TestHelper, config, Root, TubeResource, rootTestJson, tubeTestJson, tubeByBarcodeJson){
  'use strict'

  TestHelper(function(results) {
    describe("Tube Resource:-",function(){
      results.lifeCycle()

      var s2, tubePromise

      describe("modular interface", function() {
        it("should be labellable", function() {
          expect(TubeResource.instantiate({rawJson:{actions:{}}}).labelWith).toBeDefined()
        })
      })

      describe("Searching for a tube by EAN13 barcode,", function(){
        describe("and the tube IS on the system,", function(){
          beforeEach(function(){
            config.setupTest(rootTestJson)
            Root.load({user:"username"}).done(results.assignTo('root'))

            s2 = results.get('root')
            config.setupTest(tubeByBarcodeJson)

            s2.tubes.findByEan13Barcode('2345678901234').done(results.assignTo('tube'))
          })

          it("takes an EAN13 barcode and returns the corresponding resource.", function(){
            expect(results.get('tube').rawJson).toBeDefined()
          })
        })

        describe("and tube IS NOT on the system,", function(){
          beforeEach(function(){
            config.setupTest(rootTestJson)
            Root.load({user:"username"}).done(results.assignTo('root'))
            s2 = results.get('root')
            config.setupTest(tubeByBarcodeJson)
            tubePromise = s2.tubes.findByEan13Barcode('6666666666666')

          })

          it("takes an EAN13 barcode but the returned promise is rejected.", function(){
            expect(tubePromise.state()).toBe('rejected')
          })
        })
      })

      describe("once a tube has been loaded", function() {
        beforeEach(function(){
          config.setupTest(rootTestJson)
          Root.load({user:"username"}).done(results.assignTo('root'))
          s2 = results.get('root')

          config.setupTest(tubeByBarcodeJson)
          s2.tubes.findByEan13Barcode('2345678901234').done(results.assignTo('tube'))
        })

        describe(".order()", function() {
          it("resolves to an order resource.",function(){
            results.get('tube').order().done(results.assignTo('order'))
            expect(results.get('order').resourceType).toBe('order')
          })
        })

        xdescribe(".transfer", function(){
          it("can be transferred",function(){
            var tube = results.get('tube')
              , transferResults = tube.transfer(tube)
            console.warn(transferResults)

          })

        })
      })


    })
  })
})
