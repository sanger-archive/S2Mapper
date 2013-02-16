require(['scripts/s2_ajax','json/dna_only_extraction'], function(S2Ajax, testJSON){
  'use strict';

  var stage = testJSON.stage1;

  // Dummy out the ajax call returned by S2Ajax to test from file.
  // This should probably move to a test helper
  // Returns a Deferred instead of jqXHR.
  var s2_ajax = new S2Ajax({
    dummyAjax: function(options){
      var requestOptions = $.extend({
        data: {
          uuid: undefined
        }
      }, options);

      // an 'unset' options.url is set to '/'
      if (options.url.length === 0) requestOptions.url = '/';

      // We resolve the Deffered object any callbacks added with .done()
      // are called as soon as they're added.
      return $.Deferred().resolve({
        url: '/restful/fortune',
          'status': 200,
          responseTime: 750,
          responseText:stage[requestOptions.url]
      });
    }
  });


  describe('Mocked s2_ajax object', function(){
    var tube;
    s2_ajax.send(
        'read',
        '/tubes/11111111-2222-3333-4444-555555555555').
          done(function(response){
          tube = response.responseText;
        });

    it('returns an object', function(){
      expect(typeof tube).toBe('object');
    });

    it('matches data directly from JSON file', function(){
      // send uuid or barcode to grab resources
      expect(tube).toEqual(stage["/tubes/11111111-2222-3333-4444-555555555555"]);
    });

  });

  describe('S2 Root', function(){
    var s2root;

    s2_ajax.send('root').done(function(response){
      s2root = response.responseText;
    });

    it('returns an object', function(){
      expect(typeof s2root).toBe('object');
    });
  });
});
