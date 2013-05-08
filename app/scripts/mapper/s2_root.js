define([
       'config',
       'mapper/s2_ajax',
       'mapper/resources',
       'mapper/support/pluralization'
], function(config, S2Ajax, Resources) {
  'use strict';

  // register resources with root.
  var s2_ajax = new S2Ajax();

  var S2Root = Object.create(null);

  function resourceProcessor(rootInstance, resourceDeferred) {
    return function(response){
      var resource = resourceClassFrom(response, rootInstance).instantiate({ rawJson: response.responseText });
      resourceDeferred.resolve(resource);
    }
  }

  function resourceClassFrom(response, rootInstance) {
    var resourceType  = Object.keys(response.responseText)[0];
    return rootInstance[resourceType.pluralize()] || rootInstance.actions[resourceType.pluralize()];
  }

  function ajaxErrorHandler(resourceDeferred){
    return function(jqXHR, textStatus, errorThrown){
      return resourceDeferred.reject(jqXHR);
    };

  }

  // Each instance of the root is a specialised class
  function S2RootInstance() { }
  $.extend(S2RootInstance.prototype, {
    find: function(uuid){
      return this.retrieve({ uuid: uuid });
    },

    retrieve: function(options) {
      var resourceDeferred = $.Deferred();
      var url              = options.uuid? (config.apiUrl+'/'+options.uuid) : options.url;
      var ajaxProcessor    = options.resourceProcessor? options.resourceProcessor(resourceDeferred) : resourceProcessor(this, resourceDeferred);

      var ajax = s2_ajax.send(
        options.sendAction || 'read',
        url,
        options.data || null
      );

      ajax.done(ajaxProcessor).fail(ajaxErrorHandler(resourceDeferred));

      // Calling promise makes the defferd object readonly
      return resourceDeferred.promise();
    }
  });

  // Builds a root instance from the root JSON, ensuring that all of the resource types are
  // appropriately setup.
  function processRootJson(response){
    return _.chain(response.responseText)
            .pairs()
            .map(buildResourceDetails)                // Build the details of resource types to create
            .reduce(createResourceType, $.extend(new S2RootInstance(), {actions:{}})) // Create the individual resource types
            .value();

    // Handles creating the appropriate resource type from the entry in the root JSON
    function createResourceType(root, details) {
      if (typeof details.json === 'object') {
        var json = {}; json[details.name] = details.json;

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
  }

  var classMethods = {
    load: function(options){
      var rootDeferred = $.Deferred();

      // Make a call for the S2 root...
      s2_ajax.send('read', config.apiUrl).done(function(response){
        var rootInstance = processRootJson(response);
        rootInstance.user = options.user;
        rootDeferred.resolve(rootInstance);
      });


      return rootDeferred;
    }
  };

  $.extend(S2Root, classMethods);


  return S2Root;
});
