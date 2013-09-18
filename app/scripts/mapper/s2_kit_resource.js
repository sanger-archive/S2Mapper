define([
  'mapper/s2_base_resource',
  'mapper/s2_labeling_module'
], function (BaseResource) {
  'use strict';

  var instanceMethods = { };

  var Kit = BaseResource.extendAs('kit', function(kitInstance, options) {
    $.extend(kitInstance, instanceMethods);
    return kitInstance;
  });

  _.extend(Kit, {
    resourceType: 'kit',
    searchAddress: 'supportSearches',

    searchByBarcode: function() {
      return BaseResource.searchByBarcode.call(this, {
        comparison: {
          expires: { ">=": today() },
          amount:  { ">=": 1}
        }
      });
    }
  });

  return Kit;

  function pad(value) {
    return ("00" + value).slice(-2);
  }
  function today() {
    var date = new Date;
    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate())
    ].join('-');
  }
});
