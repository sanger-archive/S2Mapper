//This file is part of S2 and is distributed under the terms of GNU General Public License version 1 or later;
//Please refer to the LICENSE and README files for information on licensing and authorship of this file.
//Copyright (C) 2013 Genome Research Ltd.
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
