// TODO: Remove this once the actual action is available
define([], function() {
  console.error("BULK CREATE PLATES IS FUDGED!");
  return function(root) {
    return {
      create: function(data) {
        var json = [];

        return _.reduce(
          _.drop(data.plates, 1),
          combine,
          handle(root.plates.create(data.plates[0]))
        ).then(function() {
          return {
            result: {
              plates: json
            }
          };
        });

        function handle(deferred) {
          return deferred.then(function(plate) {
            json.push(plate.rawJson.plate);
          });
        }

        function combine(deferred, data) {
          return deferred.then(_.partial(handle, data));
        }
      }
    };
  }
});
