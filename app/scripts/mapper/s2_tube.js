define(['mapper/s2_ajax'], function(S2Ajax){
  'use strict';

  return function(uuid){
    var s2_ajax = new S2Ajax;

    return s2_ajax.send('read', '/tubes/' + uuid);
  };

})
