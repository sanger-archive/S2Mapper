define([
  'resource_test_helper',
  'config',
  'mapper/s2_root',
  'mapper/s2_kit_resource',
  'text!json/unit/root.json',
  'text!json/unit/kit_spec_data/searching.json'
], function (TestHelper, config, Root, KitResource, rootData, searchingData) {
  'use strict';

  TestHelper(function (results) {
    describe("Kit Resource", function () {
      results.lifeCycle();

      it("should be labellable", function () {
        expect(KitResource.instantiate({rawJson:{actions:{}}})).to.be.defined;
      });

      describe("while searching for a kit", function () {
        var s2;

        beforeEach(function (done) {
            config.loadTestData(rootData);
            Root.load({user:"username"})
              .then(results.assignTo('root'))
              .then(function () {
                s2 = results.get('root');
                var today = new Date;
                var todayFormatted = [
                  today.getFullYear(),
                  ("00" + (today.getMonth() + 1)).slice(-2), // for padding with zeros : 5 -> 05
                  ("00" + today.getDate()).slice(-2)         // for padding with zeros : 5 -> 05
                ].join('-');
                // because the date is hardcoded in the mapper (using today's date), we
                // have to make sure the test data can be adjusted to the same date
                searchingData = searchingData.replace(/_DATE_OF_TEST_/g, todayFormatted);
                config.cummulativeLoadingTestDataInFirstStage(searchingData);
              })
              .then(results.expected)
              .fail(results.unexpected)
              .always(done)
        });

        it("can find a valid one and return it", function (done) {
          
            results.resetFinishedFlag();
            
            s2.kits.findByEan13Barcode("1234567890")
              .then(results.assignTo('kit'))
              .then(function() {
                results.expected();
                expect(results.get('kit')).to.be.defined;
              })
              .fail(results.unexpected)
              .always(done);
          
        });
      });
    });
  });
});
