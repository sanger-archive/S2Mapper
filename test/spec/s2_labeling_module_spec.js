//This file is part of S2 and is distributed under the terms of GNU General Public License version 1 or later;
//Please refer to the LICENSE and README files for information on licensing and authorship of this file.
//Copyright (C) 2013 Genome Research Ltd.
define([
  'resource_test_helper',
  'mapper/s2_labeling_module'
], function(TestHelper, LabelingModule) {
  'use strict';

  TestHelper(function(results) {
    describe('S2Labellable', function() {

      describe('labelWith', function() {
        
        it('attaches the labels to the resource', function() {
          var object = { root: { labellables: { create: function(l){} } }, uuid: 'uuid' };
          $.extend(object, LabelingModule);
          var spy = sinon.spy(object.root.labellables, 'create');

          object.labelWith('labels');

          expect(spy).to.have.been.calledWith({ name: 'uuid', type: 'resource', labels: 'labels' });

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

          expect(result.template).to.equal(object.resourceType);
          expect(result[object.resourceType].ean13).to.equal('1234567890123');
          expect(result[object.resourceType].sanger).to.equal('ND123456K');

        });

      });
    });
  });
});
