// The constructor is designed to be passed as a callback to an
// Ajax promise.
define([], function(){
  'use strict';

  return function(tube){
  return function(response){

    tube.rawJson = response.responseText;
    tube.resourceType = 'tube';

    return tube;
  };

  };

});
