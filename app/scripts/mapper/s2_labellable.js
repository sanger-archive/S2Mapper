/*
 * Something that can have labels on it is labellable.  Require this module and extend the instance
 * with the returned object to get the appropriate functionality.
 */
define([], function() {
  'use strict';

  return {
    labelWith: function(labelDetails) {
      return this.root.labellables.create({
        'labellable': {
          name: this.uuid,
          type: "resource",
          labels: labelDetails
        }
      });
    }
  };
});
