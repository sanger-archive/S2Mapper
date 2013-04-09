define([
       'mapper/s2_base_resource',
       'mapper/s2_labellable'
], function(BaseResource, Labellable) {
  'use strict';

  var SpinColumn = BaseResource.extendAs('spin_column', function(spinColumnInstance, options) {
    $.extend(spinColumnInstance, Labellable);
    return spinColumnInstance;
  });
  SpinColumn.resourceType = 'spin_column';
  return SpinColumn;
});
