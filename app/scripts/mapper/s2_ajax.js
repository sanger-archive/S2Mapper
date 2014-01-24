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

      options.headers     = { 'Content-Type': 'application/json' };

      if (config.login !== undefined) {
        options.headers['user-email'] = config.login;
      }

      if (data) {
        // When we send data we only ever send JSON data and we pre-process it
        // so that jQuery doesn't have to.  If you remove contentType & processData
        // here then sometimes you get very very odd behaviour (POST becomes GET!)
        options.contentType = 'application/json; charset=UTF-8';
        options.data        = JSON.stringify(data);
        options.processData = false;
      }
      return config.ajax(options);
    };
  };
});
