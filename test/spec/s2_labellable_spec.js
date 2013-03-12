define([
  'resource_test_helper',
  'mapper/s2_labellable'
], function(TestHelper, Labellable) {
  'use strict';

  TestHelper(function(results) {
    describe('S2Labellable', function() {
      results.lifeCycle();

      describe('labelWith', function() {
        it('attaches the labels to the resource', function() {
          var object = { root: { labellables: { create: function(l){} } }, uuid: 'uuid' };
          $.extend(object, Labellable);
          spyOn(object.root.labellables, 'create');

          object.labelWith('labels');

          expect(object.root.labellables.create).toHaveBeenCalledWith({
            'labellable': { name: 'uuid', type: 'resource', labels: 'labels' }
          });
        });
      });
    });
  });
});
