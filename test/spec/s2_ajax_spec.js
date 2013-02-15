require(['scripts/s2_ajax','json/tube'], function(s2ajax, testJSON){
  'use strict';


  describe('s2_ajax', function(){
    it('dummy out data', function(){
      expect(s2ajax.send()).toEqual(testJSON);
    });

  });

  describe('S2 Tube Resource', function(){
  });
});
