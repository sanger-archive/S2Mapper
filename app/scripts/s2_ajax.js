define(['config'], function (config) {
  'use strict';

  var actionMethods = {
    search:  'POST',
    first:   'POST',
    create:  'POST',
    read:    'GET',
    last:    'POST',
    update:  'POST',
    root:    'GET'
  };


  return function(options){
    var thatAjax = (options.dummyAjax || $.ajax);

    // Returns an jqXHR promise or a dummy
    // passing back to the mathcing presenter, callbacks can be added
    // there.
    this.send = function(action, actionPath, data) {

      return thatAjax({
        type:         actionMethods[action],
        url:          config.apiUrl + (actionPath || ''),
        contentType:  "json",
        dataType:     "json",
        data:         data
      });
    };

  };

});
