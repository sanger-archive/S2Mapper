define([
  'resource_test_helper',
  'mapper/s2_labeling_module'
], function(TestHelper, LabelingModule) {
  'use strict';

  TestHelper(function(results) {
    describe('S2Labellable', function() {
      results.lifeCycle();

      describe('labelWith', function() {
        it('attaches the labels to the resource', function() {
          var object = { root: { labellables: { create: function(l){} } }, uuid: 'uuid' };
          $.extend(object, LabelingModule);
          spyOn(object.root.labellables, 'create');

          object.labelWith('labels');

          expect(object.root.labellables.create).toHaveBeenCalledWith({ name: 'uuid', type: 'resource', labels: 'labels' });
        });
      });

      describe('returnPrintDetails', function() {
        it('returns print details of the resource', function() {
          var object = {
            resourceType: 'tube',
            labels: {
              'barcode': {value:'1234567890123'},
              'sanger label': {value:'ND123456K'}
            }
          };
          $.extend(object, LabelingModule);
          var result = object.returnPrintDetails();

          expect(result.template).toEqual(object.resourceType);
          expect(result[object.resourceType].ean13).toEqual('1234567890123');
          expect(result[object.resourceType].sanger).toEqual('ND123456K');
        });
      });
    });
  });
});
