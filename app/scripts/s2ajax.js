define(['development_config', 's2_resource'], function (config, S2Resource) {
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
      type:       actionMethods[action],
      url:        config.apiUrl + (actionPath || ''),
      contentType:"json",
      dataType:   "json",
      data:       data,
      success:    function (json) {
        s2.emit({
          event:   'gotJson',
          callback:callback,
          data:    json
        });
      }
    });
  }

  var s2ajax = {
    send:     config.ajaxDummy || ajaxSend,
    search:   {
      barcodes: function (barcode){
        s2ajax.ajaxSend('search', S2.resources.search.all, {barcode: barcode}, S2.resources.add);
    }
  },

  parseJson:function (json) {
    var key, resource;
    for (key in json) {
      resource = new S2Resource(key, json[key]);
    }
  }
};

return s2ajax;
});
