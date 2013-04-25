define([
  'mapper/s2_base_resource'
], function(BaseResource){
  'use strict';

  var Labellable = BaseResource.extendAs('labellable', function(labellableInstance, options) {
    $.extend(labellableInstance, instanceMethods);
    return labellableInstance;
  });

  Labellable.resourceType = 'labellable';

  var instanceMethods = {
  };

  return Labellable;
});

