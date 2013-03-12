define(['require'], function(require){
  'use strict';

  // BaseResource is intended to be an abstract class used by concrete
  // resource types such as tube, order and spin column.
  var BaseResource = Object.create(null);

  function actionHelper(name) {
    return function(sendData, resourceProcessor) {
      var actionUrl = this.actions[name];
      if (actionUrl === undefined) { throw 'No ' + name + ' action URL'; }

      return this.root.something({
        url:                actionUrl,
        sendAction:         name,
        data:               sendData,
        resourceProcessor:  resourceProcessor
      });
    }
  };

  var instanceMethods = {
    // Standard actions for all resources
    create: actionHelper('create'),
    read:   actionHelper('read'),
    update: actionHelper('update'),
    delete: actionHelper('delete'),

    // Pagination and searching
    first: actionHelper('first'),
    last:  actionHelper('last')
  };

  $.extend(BaseResource, {
    instantiate: function(opts){
      var options           = $.extend({}, opts);
      var rawJson           = options.rawJson;
      var resourceInstance  = Object.create({ isNew: true });
      resourceInstance.root = this.root || options.root;

      if (rawJson !== undefined){
        resourceInstance.isNew        = false;
        resourceInstance.rawJson      = rawJson;
        resourceInstance.resourceType = Object.keys(rawJson)[0];
        $.extend(resourceInstance, rawJson[resourceInstance.resourceType]);
      } else {
        // TODO: resourceInstance.resourceType = ???
      }

      $.extend(resourceInstance, instanceMethods);
      return resourceInstance;
    },


    findByEan13Barcode: function(ean13){

      if (this.resourceType === undefined) throw {
        name:     'Unknown ResourceType',
        message:  'resourceType not set for this class'
      }

      return 'NOT_IMPLETMENTED';
    },

    new: function(options){
      return this.instantiate(options);
    }
  });

  return BaseResource;
});
