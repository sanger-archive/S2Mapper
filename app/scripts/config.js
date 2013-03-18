define ([], function () {
  'use strict';
  return {
    // URL & Ajax interface to the API
    apiUrl:'',
    ajax:$.ajax,

    // URL for the barcode printing service
    printServiceUrl:'',
    printers: [ { name: 'e367bc', type: 2 } ]
  };
});
