define([
  'resource_test_helper',
  'config',
  'mapper/s2_root',
  'mapper/s2_search_resource',
  'text!json/unit/root.json',
  'text!json/unit/searching.json'
], function(TestHelper, config, Root, SearchResource, rootData, searchData) {
  'use strict';

  TestHelper(function(results) {
    describe("SearchResource", function() {
      results.lifeCycle();

      var s2, handler;

      beforeEach(function() {
        config.setupTest(rootData);
        Root.load().done(results.assignTo('root'));
        s2 = results.get('root');

        handler = s2.searches.handling(s2.batches);
        config.setupTest(searchData);
      });

      describe('handling resource', function() {
        describe('first', function() {
          it('returns the first page of results', function() {
            handler.first({}).done(results.assignTo('results'));
            expect(results.get('results')[0].name).toBe('first page');
          });
        });

        describe('last', function() {
          it('returns the last page of results', function() {
            handler.last({}).done(results.assignTo('results'));
            expect(results.get('results')[0].name).toBe('last page');
          });
        });
      });
    });
  });
});
