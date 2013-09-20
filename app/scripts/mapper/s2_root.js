define([
  "config",
  "mapper/s2_ajax",
  "mapper/resources",
  "mapper/s2_bulk_create_plates",
  "mapper/support/pluralization"
], function(config, S2Ajax, Resources, BulkPlateCreator) {
  "use strict";

  // register resources with root.
  var s2ajax = new S2Ajax();

  var S2Root = Object.create(null);

  function resourceProcessor(rootInstance, resourceDeferred, resourceType) {

    return function(response){
      var resourceClass = Object.keys(response.responseText)[0].pluralize();

      var resource = rootInstance[resourceClass].instantiate({ rawJson: response.responseText });
      return resourceDeferred.resolve(resource);
    };
  }

  function ajaxErrorHandler(resourceDeferred){
    return function(jqXHR){
      return resourceDeferred.reject(jqXHR);
    };

  }

  // Each instance of the root is a specialised class
  function S2RootInstance() { }
  $.extend(S2RootInstance.prototype, {
    find: function(uuid){
      return this.retrieve({
        uuid: uuid,
        s2AppUrl: 'lims-laboratory'
      });
    },

    findByLabEan13: function(ean13){
      var root = this;
      return this.laboratorySearches.handling(this.labellables).first({
        user:          this.user,
        description:   "search for barcoded labellable",
        model:         "labellable",
        criteria: {
          type:       "resource",
          label: {
            position: "barcode",
            type:     "ean13-barcode",
            value:    ean13
          }
        }
      }).then(function(labellable) {
        return root.find(labellable.name);
      });
    },

    retrieve: function(options) {
      var resourceDeferred = $.Deferred();

      var s2AppUrl         = options.s2AppUrl ?  config.apiUrl + options.s2AppUrl : config.apiUrl;
      var url              = options.uuid? (s2AppUrl+"/"+options.uuid) : options.url;
      var ajaxProcessor    = options.resourceProcessor? options.resourceProcessor(resourceDeferred) : resourceProcessor(this, resourceDeferred, options.resourceType);

      var ajax = s2ajax.send(
        options.sendAction || "read",
        url,
        options.data || null
      );

      ajax.done(ajaxProcessor).fail(ajaxErrorHandler(resourceDeferred));

      return resourceDeferred.promise();
    }
  });

  // Builds a root instance from the root JSON, ensuring that all of the resource types are
  // appropriately setup.
  function processRootJson(response){
    // Handles creating the appropriate resource type from the entry in the root JSON
    function createResourceType(root, details) {
      if (typeof details.json === "object") {
        var json = {};
        json[details.name] = details.json;

        details.nesting(root)[details.name] = $.extend(
          Resources.base.instantiate({ root: root, rawJson: json }),
          Resources.get(details.name)
        );
      }
      return root;
    }

    // Maps the name and resource details in the root JSON so that they can be turned into
    // resource classes, and at the appropriate nesting.
    function buildResourceDetails(pair) {
      // TODO: Refactor this once the root JSON from S2 has been fixed
      var nester = function(root) { return root; };   // Default to top-level nesting
      if (pair[0].match(/^(create|update|transfer)_|_(transfers|moves)$|^tag_wells$/)) {
        nester = function(root) { return root.actions; };
      }

      return {
        name:pair[0].removeHyphen(),
        json:pair[1],
        nesting:nester
      };
    }

    return _.chain(response.responseText)
    .pairs()
    .map(buildResourceDetails)                // Build the details of resource types to create
    .reduce(createResourceType, $.extend(new S2RootInstance(), {actions:{}})) // Create the individual resource types
    .value();

  }

  var classMethods = {
    load: function(options){
      var rootDeferred = $.Deferred();

      // Make a call for the S2 root...
      s2ajax.send("read", config.apiUrl).done(function(response){
        var rootInstance = processRootJson(response);
        rootInstance.user = options.user;
        rootInstance.bulk_create_plates = BulkPlateCreator(rootInstance);
        rootDeferred.resolve(rootInstance);
      });


      return rootDeferred;
    }
  };

  $.extend(S2Root, classMethods);


  return S2Root;
});
