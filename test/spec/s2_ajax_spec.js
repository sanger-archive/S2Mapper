require(['scripts/s2_ajax','json/dna_only_extraction', 'config'], function(S2Ajax, testJSON, config){
  'use strict';

  config.testJSON = testJSON.stage1;

  var s2_ajax = new S2Ajax();


  describe('Mocked s2_ajax object', function(){
    var tube;
    s2_ajax.send(
        'read',
        '/tubes/11111111-2222-3333-4444-555555555555').
          done(function(response){
          tube = response.responseText;
        });

    it('returns an S2Resource object', function(){
      expect(tube).toBeDefined();
    });

    it('matches data directly from JSON file', function(){
      // send uuid or barcode to grab resources
      expect(tube).toEqual(config.testJSON["/tubes/11111111-2222-3333-4444-555555555555"]);
    });

  });

  describe('S2 Root', function(){
    // We can only access the response object through a side effect.
    var s2root;

    s2_ajax.send('read').done(function(response){
      s2root = response.responseText;
    });

    it('returns an object', function(){
      expect(s2root).toBeDefined();
    });

    it('returns an object containing searches', function(){
      expect(s2root.searches).toBeDefined();

    });
  });



});
