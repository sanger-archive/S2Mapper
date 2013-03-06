define (['config'], function (config) {
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
    // This is an injection of ajax behaviour to allow us to
    // unit test from file.

    // Returns an jqXHR promise or a dummy
    // passing back to the mathcing presenter, callbacks are added there.
    this.send = function (action, actionPath, data) {

      return config.ajax ({
        type:       actionMethods[action],
        url:        config.apiUrl + (actionPath || ''),
        contentType:"json",
        dataType:   "json",
        data:       data
      });
    };

  };

});
