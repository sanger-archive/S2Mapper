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
    describe("Searches", function() {
      testSearch('support', results);
      testSearch('laboratory', results);
    });
  });

  function testSearch(name, results) {
    describe(name, function () {

      var s2, handler;

      beforeEach(function (done) {
          config.loadTestData(rootData);
          Root.load({user:"username"})
              .then(results.assignTo('root'))
              .then(function () {
                s2 = results.get('root');
                return s2[name + "Searches"].handling(s2.batches);
              })
              .then(function (ret) {
                handler = ret;
                config.cummulativeLoadingTestDataInFirstStage(searchData)
              })
              .then(results.expected)
              .fail(results.unexpected)
              .always(done);
      });

      describe('handling resource', function () {
        describe('firstPage', function () {
          it('returns the first page of results', function (done) {
            handler.firstPage({})
                   .then(function(results) { expect(results[0].name).to.equal('first page'); })
                   .fail(results.unexpected)
                   .always(done);
          });
        });

        describe('lastPage', function () {
          it('returns the last page of results', function (done) {
            handler.lastPage({})
                   .then(function(results) { expect(results[0].name).to.equal('last page 1'); })
                   .fail(results.unexpected)
                   .always(done);
          });
        });

        describe('last', function () {
          it('returns the last result of the last page of results', function (done) {
            handler.last({})
                   .then(function(results) {
                     expect(results.name).to.equal('last page 2');
                     expect(results.index).to.equal(1);
                   })
                   .fail(results.unexpected)
                   .always(done);
          });
        });

        describe('all', function () {
          it('returns all results', function (done) {
            handler.all({})
                   .then(function(results) {
                     expect(_.pluck(results, 'name')).to.deep.equal(['first page', 'last page 1', 'last page 2']);
                   })
                   .fail(results.unexpected)
                   .always(done);
          });
        });
      });
    });
  }
});
