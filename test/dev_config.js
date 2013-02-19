// Change workflowJSON dependency and currentStage to reflect the world you
// want to live in...
define(['test_config','json/dna_only_extraction'], function(test_config, workflowJSON) {
  'use strict';

  return $.extend(test_config, {
    currentStage: 'stage1',
    testJSON: workflowJSON
  });

});
