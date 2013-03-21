define([ 'resource_test_helper'
       , 'config'
       , 'mapper/s2_root'
       , 'mapper/s2_tube_resource'
       , 'text!json/unit/root.json'
       , 'text!json/unit/tube.json'
       , 'text!json/unit/empty_tube_search.json'
]

, function(TestHelper, config, Root, TubeResource, rootTestJson, tubeByBarcodeJson){
  'use strict'

  TestHelper(function(results){
    describe("TestConfig:-", function(){
      var s2, tubePromise, ajaxPromise
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

      describe("Searching for a barcode that's not on the system,", function(){
        beforeEach(function(){
          config.setupTest(rootTestJson)

          Root.load().done(results.assignTo('root'))
          s2 = results.get('root')

          ajaxPromise = s2.searches.create({
            "search":  {
              "description":  "search for barcoded tube",
              "model":        "tube",
              "criteria":     {
                "label":  {
                  "position":  "barcode",
                  "type":      "ean13-barcode",
                  "value":     "6666666666666"
                }
              }
            }
          })
        })

        it("returns a resolved promise to simlutate the returned search response.", function(){
          expect(ajaxPromise.state()).toBe('resolved')
        })

      })
    })
  })
})
