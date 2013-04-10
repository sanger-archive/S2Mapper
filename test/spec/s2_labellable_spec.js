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

          expect(object.root.labellables.create).toHaveBeenCalledWith({ name: 'uuid', type: 'resource', labels: 'labels' });
        });
      });
      describe('returnPrintDetails', function() {
        it('returns print details of the resource', function() {
          var object = { root: {
                          labellables: {
                            create: function(l){} } },
                         uuid: 'uuid',
                           labels: {
                             'sanger label': {
                               value: 'ND1233334K'
                             }
                         }};
          $.extend(object, Labellable);
          spyOn(object.root.labellables, 'create');

          object.labelWith('labels');
          var result = object.returnPrintDetails();

          expect(result).toBeDefined();
          expect(result.prefix).toEqual('ND');
          expect(result.barcode).toEqual('1233334');
          expect(result.suffix).toEqual('K');
          expect(result.name).toEqual('X');
          expect(result.description).toEqual('X');
          expect(result.project).toEqual('X');
        });
      });
    });
  });
});
