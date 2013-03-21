define(['config'], function(config) {
  'use strict';

  // actionMethods maps the ajax request type to RESTful CRUD operations,
  // so:-
  //   Create operations (create and search) map to HTTP POST
  //   Read operations (first, last, read) map to HTTP GET.
  //   Upate  to HTTP PUT
  //   Delete to HTTP DELETE
  var actionMethods = {
    search:'POST', // This a POST because we are creating a search object
    first: 'GET',
    create:'POST',
    read:  'GET', // Read maps to GET
    last:  'GET',
    update:'PUT', // Update maps to PUT
    'delete':'DELETE' // Update maps to PUT
  };

  return function () {
    // Returns an jqXHR promise or a dummy
    this.send = function(action, actionPath, data) {
      var options = {
        type:     actionMethods[action],
        url:      actionPath,
        dataType: "json"
      };
      if (data) {
        options.headers = { 'Content-Type': 'application/json' };
        options.data    = JSON.stringify(data);
      }
      return config.ajax(options);
    };
  };
});
