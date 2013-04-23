define([
       'mapper/s2_base_resource',
       'mapper/s2_labeling_module'
], function(BaseResource, LabelingModule) {
  'use strict';

  var SpinColumn = BaseResource.extendAs('spin_column', function(spinColumnInstance, options) {
    $.extend(spinColumnInstance, LabelingModule);
    return spinColumnInstance;
  });
  SpinColumn.resourceType = 'spin_column';
  return SpinColumn;
});
