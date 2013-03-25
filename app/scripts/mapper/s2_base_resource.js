define([], function(){
  'use strict';

  // BaseResource is intended to be an abstract class used by concrete
  // resource types such as tube, order and spin column.
  var BaseResource = Object.create(null);

  function actionIsIdempotent(name) {
    return actionHelper(name, function(options) {
      return options;
    });
  }
  function actionChangesState(name, dataHandler) {
    dataHandler = dataHandler || function(data) { return data; }
    return actionHelper(name, function(options, sendData) {
      sendData = $.extend({user: this.root.user}, sendData || {});
      options['data']  = dataHandler.apply(this, [sendData]);
      return options
    });
  }
  function actionHelper(name, setup) {
    return function(sendData, resourceProcessor) {
      var actionUrl = this.actions[name];
      if (actionUrl === undefined) { throw 'No ' + name + ' action URL'; }

      return this.root.retrieve(setup.apply(this, [{
        url:                actionUrl,
        sendAction:         name,
        resourceProcessor:  resourceProcessor
      }, sendData]));
    }
  };

  var instanceMethods = {
    // Standard actions for all resources
    create: actionChangesState('create', function(data) {
      var d = {}; d[this.resourceType] = data; return d;
    }),
    read:   actionIsIdempotent('read'),
    update: actionChangesState('update'),
    delete: actionChangesState('delete'),

    // Pagination and searching
    first: actionIsIdempotent('first'),
    last:  actionIsIdempotent('last')
  };

  $.extend(BaseResource, {
    // Convenience method for creating extensions of the base resource class.
    extendAs: function(resourceType, constructor) {
      var resourceClass = Object.create(this);
      resourceClass.resourceType = resourceType;
      resourceClass.constructor  = constructor || this.constructor;
      return resourceClass;
    },

    register: function(callback) { callback(this.resourceType, this); },
    constructor: function(instance) { return instance; },

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
        resourceInstance.resourceType = this.resourceType;
      }

      $.extend(resourceInstance, instanceMethods);
      return this.constructor(resourceInstance, options);
    },

    new: function(options){
      var instance = this.instantiate(options);
      if (instance.actions === undefined) { instance.actions = {}; }
      return instance;
    }
  });

  return BaseResource;
});
