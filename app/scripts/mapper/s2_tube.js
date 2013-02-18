// This factory creates a callback functions
define([], function(){
  'use strict';

  return function(tube){

    // This callback returns nothing but modifies tube
    return function(response){
      tube.rawJson      = response.responseText;
      tube.resourceType = 'tube';
    };
  };

});
