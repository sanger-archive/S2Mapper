require(['app','tube'],function(app){
  'use strict';
  var dummyAjax = function() {
  };

  beforeEach(function(){
    //Dumy Ajax function
  });

  describe('Tube', function(){
    describe('Loading an S2 Tube',function(){
      it('fails', function(){
        expect(app).toBe('Hello from Yeoman!');
      });

    });

  });
});
