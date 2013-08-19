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

      var s2, handler;

      beforeEach(function (done) {
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
            .fail(results.unexpected)
            .always(done);
      });

      describe('handling resource', function () {
        
        describe('firstPage', function () {
          
          it('returns the first page of results', function (done) {
            handler.firstPage({})
              .then(function(results) {
                expect(results[0].name).to.equal('first page');
              })
              .fail(results.unexpected)
              .always(done);

          });

        });

        describe('lastPage', function () {
          
          it('returns the last page of results', function (done) {
            handler.lastPage({})
              .then(function(results) {
                expect(results[0].name).to.equal('last page');
              })
              .fail(results.unexpected)
              .always(done);

          });
        
        });

        describe('last', function () {
          
          it('returns the last result of the last page of results', function (done) {

            handler.last({})
              .then(function(results) {
                expect(results.name).to.equal('last page');
                expect(results.index).to.equal(9);
              })
              .fail(results.unexpected)
              .always(done);

          });
        });
      });
    });
    describe("supportSearches", function () {
      var s2, handler;

      beforeEach(function (done) {

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
          .fail(results.unexpected)
          .always(done);
      });

      describe('handling resource', function () {
        
        describe('firstPage', function () {
          
          it('returns the first page of results', function (done) {

            handler.firstPage({})
              .then(function(results) {
                expect(results[0].name).to.equal('first page');
              })
              .fail(results.unexpected)
              .always(done);
          
          });
        
        });

        describe('lastPage', function () {
          it('returns the last page of results', function (done) {

            handler.lastPage({})
              .then(function(results) {
                expect(results[0].name).to.equal('last page');
              })
              .fail(results.unexpected)
              .always(done);

          });

        });

        describe('last', function () {
          it('returns the last result of the last page of results', function (done) {

            handler.last({})
              .then(function(results) {
                expect(results.name).to.equal('last page');
                expect(results.index).to.equal(9);
              })
              .fail(results.unexpected)
              .always(done);

          });
        });
      });
    });
  });
});
