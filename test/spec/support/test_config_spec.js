define([ 'resource_test_helper'
       , 'config'
       , 'mapper/s2_root'
       , 'mapper/s2_tube_resource'
       , 'text!json/unit/root.json'
       , 'text!json/unit/tube.json'
]

, function(TestHelper, config, Root, TubeResource, rootTestJson, tubeByBarcodeJson){
  'use strict'

  TestHelper(function(results){
    describe("TestConfig:-", function(){
      var s2, tubePromise
      results.lifeCycle()

      describe("When it can't find a resource by UUID,", function(){

        beforeEach(function(){
          config.setupTest(rootTestJson)

          Root.load().done(results.assignTo('root'))
          s2 = results.get('root')

          tubePromise = s2.find('NOT-A-VALID-UUID')

        })

        it("returns a 404 status code.", function(){
          expect(tubePromise.state()).toBe('rejected')
        })

      })

      xdescribe("Searching for a barcode that's not on the system,", function(){
        beforeEach(function(){
          config.setupTest(rootTestJson)

          Root.load().done(results.assignTo('root'))
          s2 = results.get('root')

          tubePromise = s2.tubes.findByEan13Barcode('6666666666666')
        })

        it("")

      })
    })
  })
})
