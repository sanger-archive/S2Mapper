define([], function(){
  "use strict";

  // Here are all of the different barcode types, which will be exposed as
  // search functions (map from search function name to type).
  var BarcodeTypes = {
    ean13:   "ean13-barcode",
    sanger:  "sanger_barcode",
    two_d:   "barcode2_d",
    code128: "code128-c-barcode"
  };

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
      options.data  = dataHandler.apply(this, [sendData,options]);
      return options
    });
  }

  function actionHelper(name, setup) {
    return function(sendData, resourceProcessor, options) {
      var actionUrl = this.actions[name];
      if (actionUrl === undefined) { throw 'No ' + name + ' action URL'; }

      if (!resourceProcessor) {
        var model = this.instantiate ? this : this.root[this.resourceType.pluralize()];
        resourceProcessor = function(resourceDeferred) {
          return function(response) {
            resourceDeferred.resolve(model.instantiate({ rawJson: response.responseText }));
          };
        };
      }

      var data = _.extend({
        url:                actionUrl,
        sendAction:         name,
        resourceProcessor:  resourceProcessor,
        resourceType:       this.resourceType
      }, options || {});

      $.extend(sendData, this.creationTemplate);

      return this.root.retrieve(setup.apply(this, [data, sendData]));
    };
  }

  var instanceMethods = {
    // Standard actions for all resources
    create: actionChangesState("create", function(data, options) {
      var key = (options || {}).resourceType || this.resourceType;

      if (this.resourceType === "laboratorySearch" || this.resourceType === "supportSearch" || this.resourceType === "managementSearch" || this.resourceType === "qualitySearch") {
        key = "search"
      }

      var d = {}; d[key] = data;
      return d;
    }),

    read:   actionIsIdempotent("read"),
    update: actionChangesState("update"),
    delete: actionChangesState("delete"),

    // Pagination and searching
    first: actionIsIdempotent("first"),
    last:  actionIsIdempotent("last")
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
    searchAddress: "laboratorySearches", // by default

    // Convenience method for creating extensions of the base resource class.
    extendAs: function(resourceTypes, constructor) {
      var baseResource = this;
      var resourceClasses;
      var argumentWasArray = true;

      // When we are given an array for the resourceTypes we are to assume that
      // the first element is the JSON element, and the subsequent entries are the
      // names under which to register.
      var resourceType = resourceTypes;
      if (Array.isArray(resourceTypes)) {
        resourceType  = resourceTypes[0];
        resourceTypes = _.drop(resourceTypes, 1);
      } else {
        resourceTypes = [resourceTypes];
      }

      var resourceClass = Object.create(baseResource);
      resourceClass.resourceType = resourceType;
      resourceClass.constructor  = constructor || baseResource.constructor;

      // A single resource class can be registered under many names, so we handle
      // that by repeatedly calling the callback.
      resourceClass.register     = function(callback) {
        _.each(resourceTypes, function(n) { callback(n, resourceClass); });
      };
      return resourceClass;
    },

    constructor: function(instance) { return instance; },

    instantiate: function(opts){
      var options                        = $.extend({}, opts);
      var rawJson                        = options.rawJson;
      var resourceInstance               = Object.create({ isNew: true });
      resourceInstance.root              = this.root || options.root;
      resourceInstance.transferBehaviour = this.transferBehaviour;

      if (rawJson !== undefined){
        resourceInstance.isNew        = false;
        resourceInstance.rawJson      = rawJson;
        resourceInstance.resourceType = Object.keys(rawJson)[0];
      } else {
        resourceInstance.rawJson           = {};
        resourceInstance.resourceType      = this.resourceType;
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

    /*
     * This function returns an object that can be used to build barcoded
     * searches.  The returned object supports all of the BarcodeTypes functions,
     * and each of those supports all of the search related functions.
     */
    searchByBarcode: _.partial(searchByLabel, "barcode", BarcodeTypes),

    // Support the ability for search by any "identifier", although you then have to
    // specify the type of this label in the search.
    searchByIdentifier: _.partial(searchByLabel, "identifier", {labelled: undefined}),
    
    // Delegated to the specific type
    processItemOrderUpdate: _.identity
  });

  return BaseResource;

  function searchByLabel(position, types, additionalCriteria) {
    var resource = this;
    var search   = resource.root[resource.searchAddress].handling(resource);

    var basicConditions = {
      user:        resource.root.user,
      description: "search for " + resource.resourceType + " with label @ " + position,
      model:       resource.resourceType,
      criteria:    _.extend({}, additionalCriteria || {})
    };

    return _.chain(types)
            .map(buildSearch)
            .object()
            .value();

    function deepClone(object) {
      return _.chain(object)
              .map(function(v,k) { return [k, clone(v)]; })
              .object()
              .value();

      function clone(value) {
        if (_.isObject(value)) {
          return deepClone(value);
        } else if (_.isArray(value)) {
          return _.map(clone);
        } else {
          return value;
        }
      }
    }

    function buildSearch(type, name) {
      return [name, _.isUndefined(type) ? Search : _.partial(Search, type)];
    }

    function Search(type, barcode) {
      var conditions = deepClone(basicConditions);
      _.extend(conditions.criteria, {
        label: {
          position: position,
          type:     type,
          value:    barcode
        }
      });

      // Every single search function provided should be exposed here but bound to the
      // criteria that have been passed in.
      return _.chain(search)
              .map(function(f,n) { return [n, _.partial(f, conditions)]; })
              .object()
              .value();
    }
  }
});
