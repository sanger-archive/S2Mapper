define(['mapper/s2_base_resource'], function(BaseResource){
  'use strict';

  var Batch = BaseResource.extendAs('batch');

  var instanceMethods = {
    items: []

  };


  var classMethods = {
    instantiate: function(opts){
      var options = opts || {};
      var batchInstance = BaseResource.instantiate(options);

      $.extend(batchInstance, instanceMethods);

      batchInstance.items = options.items;

      return batchInstance;
    }
  };

  $.extend(Batch, classMethods);
  return Batch;

});
