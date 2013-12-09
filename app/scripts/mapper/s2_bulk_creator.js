// TODO: Remove this once the actual action is available
define([], function() {
  console.warn("BULK CREATE IS FUDGED!");
  return function(root, singularModel) {
    var pluralModel = singularModel + "s";
    return {
      create: function(data) {
        var json = [];

        return _.reduce(
          _.drop(data[pluralModel], 1),
          combine,
          handle(root[pluralModel].create(data[pluralModel][0]))
        ).then(function() {
          var result = {result:{}};
          result.result[pluralModel] = json;
          return result;
        });

        function handle(deferred) {
          return deferred.then(function(resource) {
            json.push(resource.rawJson[singularModel]);
          });
        }

        function combine(deferred, data) {
          return deferred.then(function() {
            return handle(root[pluralModel].create(data));
          });
        }
      }
    };
  }
});
