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
    };
  }

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

  // Proxy the raw JSON so that we can change that behind the scenes if required and it
  // magically applies to all calling code.  We do not override any behaviour that
  // already exists in the instance..
  function injectRawJsonProxy(instance, rawJson) {
    if (rawJson === undefined) return;

    Object.defineProperties(
      instance, 
      _.chain(rawJson).keys().difference(Object.getOwnPropertyNames(instance)).reduce(function(proxyMethods, name) {
        proxyMethods[name] = { get: function() { return rawJson[name]; } };
        return proxyMethods;
      }, {}).value()
    );
  }

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
      } else {
        resourceInstance.rawJson      = {};
        resourceInstance.resourceType = this.resourceType;
        resourceInstance.rawJson[resourceInstance.resourceType] = {};
      }

      $.extend(resourceInstance, instanceMethods);
      resourceInstance = this.constructor(resourceInstance, options);
      injectRawJsonProxy(resourceInstance, resourceInstance.rawJson[resourceInstance.resourceType]);
      return resourceInstance;
    },

    new: function(options){
      var instance = this.instantiate(options);
      if (instance.actions === undefined) { instance.actions = {}; }
      return instance;
    },

    findByEan13Barcode: function(ean13){
      return this.findByBarcode("ean13-barcode",ean13);
    },

    findBySangerBarcode: function(sangerBarcode){
      return this.findByBarcode("sanger_barcode", sangerBarcode);
    },

    findByBarcode2DBarcode: function(barcode2D){
      return this.findByBarcode("barcode2_d", barcode2D);
    },

    findByBarcode: function(barcodetype,barcodeValue){
      var root          = this.root;
      var baseRsc = this;

      return root.searches.handling(baseRsc).first({
        "user":         root.user,
        "description":  "search for barcoded "+baseRsc.resourceType,
        "model":        baseRsc.resourceType,
        "criteria":     {
          "label":  {
            "position":  "barcode",
            "type":      barcodetype,
            "value":     barcodeValue
          }
        }
      });
    }

  });

  return BaseResource;
});
