define(['config', 'mapper/s2_ajax'], function(config, S2Ajax){
  'use strict';

  config.setTestJson('dna_only_extraction');

  var s2_ajax = new S2Ajax();


  describe('Mocked s2_ajax object', function(){
    config.currentStage = 'stage1';
    var tube;
    s2_ajax.send(
        'read',
        '/11111111-2222-3333-4444-555555555555').
          done(function(response){
          tube = response.responseText;
        });

    it('returns an S2Resource object', function(){
      expect(tube).toBeDefined();
    });

    it('matches data directly from JSON file', function(){
      // send uuid or barcode to grab resources
      expect(tube).toEqual(config.getTestJson()["/11111111-2222-3333-4444-555555555555"]);
    });

  });

  describe('S2 Root', function(){
    config.currentStage = 'stage1';

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
