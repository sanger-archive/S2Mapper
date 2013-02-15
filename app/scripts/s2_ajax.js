define(['config', 's2_resource'], function (config, S2Resource) {
  'use strict';

  var actionMethods = {
    search:'POST',
    first: 'post',
    create:'post',
    read:  'post',
    last:  'post',
    update:'post',
    root:  'GET'
  };

  function ajaxSend(action, actionPath, data, callback) {
    $.ajax({
      type:         actionMethods[action],
      url:          config.apiUrl + (actionPath || ''),
      contentType:  "json",
      dataType:     "json",
      data:         data
    });
  }

  return {
    send: config.ajaxDummy || ajaxSend
  };

});
