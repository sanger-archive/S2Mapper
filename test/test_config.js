define(['json/tube'], function(tubeJSON) {
  'use strict';

  return {
    apiUrl:    'json/',
    ajaxStub:  function(){return tubeJSON;}
  };
});
