define([
  'resource_test_helper',
  'config',
  'mapper/s2_root',
  'mapper/s2_search_resource',
  'text!json/unit/root.json',
  'text!json/unit/searching.json'
], function (TestHelper, config, Root, SearchResource, rootData, searchData) {
  'use strict';

  TestHelper(function (results) {
    describe("laboratorySearches", function () {
      results.lifeCycle();

      var s2, handler;

      beforeEach(function () {
        runs(function () {
          config.loadTestData(rootData);
          Root.load({user:"username"})
              .then(results.assignTo('root'))
              .then(function () {
                s2 = results.get('root');
                return s2.laboratorySearches.handling(s2.batches);
              })
              .then(function (ret) {
                handler = ret;
                config.cummulativeLoadingTestDataInFirstStage(searchData)})
              .then(results.expected)
              .fail(results.unexpected);
        });
        waitsFor(results.hasFinished);
      });

      describe('handling resource', function () {
        describe('firstPage', function () {
          it('returns the first page of results', function () {
            results.reset();

            runs(function(){
              handler.firstPage({})
                  .then(results.assignTo('results'))
                  .then(results.expected)
                  .fail(results.unexpected);
            });

            waitsFor(results.hasFinished);

            runs(function(){
              expect(results.get('results')[0].name).toEqual('first page');
            });
          });
        });

        describe('lastPage', function () {
          it('returns the last page of results', function () {

            results.reset();

            runs(function(){
              handler.lastPage({})
                  .then(results.assignTo('results'))
                  .then(results.expected)
                  .fail(results.unexpected);
            });

            waitsFor(results.hasFinished);

            runs(function(){
              expect(results.get('results')[0].name).toEqual('last page');
            });
          });
        });

        describe('last', function () {
          it('returns the last result of the last page of results', function () {

            results.reset();

            runs(function(){
              handler.last({})
                  .then(results.assignTo('results'))
                  .then(results.expected)
                  .fail(results.unexpected);
            });

            waitsFor(results.hasFinished);

            runs(function(){
              expect(results.get('results').name).toEqual('last page');
              expect(results.get('results').index).toEqual(9);
            });
          });
        });
      });
    });
    describe("supportSearches", function () {
      results.lifeCycle();

      var s2, handler;

      beforeEach(function () {
        runs(function () {
          config.loadTestData(rootData);
          Root.load({user:"username"})
              .then(results.assignTo('root'))
              .then(function () {
                s2 = results.get('root');
                return s2.supportSearches.handling(s2.batches);
              })
              .then(function (ret) {
                handler = ret;
                config.cummulativeLoadingTestDataInFirstStage(searchData)})
              .then(results.expected)
              .fail(results.unexpected);
        });
        waitsFor(results.hasFinished);
      });

      describe('handling resource', function () {
        describe('firstPage', function () {
          it('returns the first page of results', function () {
            results.reset();

            runs(function(){
              handler.firstPage({})
                  .then(results.assignTo('results'))
                  .then(results.expected)
                  .fail(results.unexpected);
            });

            waitsFor(results.hasFinished);

            runs(function(){
              expect(results.get('results')[0].name).toEqual('first page');
            });
          });
        });

        describe('lastPage', function () {
          it('returns the last page of results', function () {

            results.reset();

            runs(function(){
              handler.lastPage({})
                  .then(results.assignTo('results'))
                  .then(results.expected)
                  .fail(results.unexpected);
            });

            waitsFor(results.hasFinished);

            runs(function(){
              expect(results.get('results')[0].name).toEqual('last page');
            });
          });
        });

        describe('last', function () {
          it('returns the last result of the last page of results', function () {

            results.reset();

            runs(function(){
              handler.last({})
                  .then(results.assignTo('results'))
                  .then(results.expected)
                  .fail(results.unexpected);
            });

            waitsFor(results.hasFinished);

            runs(function(){
              expect(results.get('results').name).toEqual('last page');
              expect(results.get('results').index).toEqual(9);
            });
          });
        });
      });
    });
  });
});
