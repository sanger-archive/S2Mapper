define([], function(){
  'use strict';

  // BaseResource is intended to be an abstract class used by concrete
  // resource types such as tube, order and spin column.
  var BaseResource = Object.create(null);

  function actionHelper(name) {
    return function(sendData, resourceProcessor) {
      var actionUrl = this.actions[name];
      if (actionUrl === undefined) { throw 'No ' + name + ' action URL'; }

      var actionOptions = {
        url:                actionUrl,
        sendAction:         name,
        resourceProcessor:  resourceProcessor
      };
      if ((sendData !== undefined) && (sendData !== null)) {
        actionOptions['data'] = {}
        actionOptions['data'][this.resourceType] = sendData;
      }
      return this.root.retrieve(actionOptions);
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
    // Convenience method for creating extensions of the base resource class.
    extendAs: function(resourceType) {
      var resourceClass = Object.create(this);
      resourceClass.resourceType = resourceType;
      return resourceClass;
    },

    register: function(callback) { callback(this.resourceType, this); },

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

    new: function(options){
      return this.instantiate(options);
    }
  });

  return BaseResource;
});
