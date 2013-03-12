define(['config',
       'mapper/s2_root',
       'text!json/unit/root.json',
       'text!json/unit/tube.json'
], function(config, S2Root,rootTestJson, tubeTestJson){
  'use strict';

  // We use an empty object for test results so that we can use a
  // string as a pointer to a returned value.
  var results, rawRootJson;

  function assignResultTo(target){
    return function(source){
      // Assignment through side effect; simultates callback.
      results[target] = source;
    }
  }


  describe("S2Root:-", function(){
    var rootPromise;

    describe("Loading an S2 root,", function(){
      beforeEach(function(){
        rawRootJson = config.setupTest(rootTestJson);
        results             = {};
        rootPromise         = S2Root.load();
        rootPromise.done(assignResultTo('root'));
      });

      it("returns a promise.", function(){
        expect(rootPromise.done).toBeDefined();
      });

      it("resolves to a hash of S2Resources.", function(){
        var diffExpectedWithRoot = _.difference(
          Object.keys(rawRootJson),
          Object.keys(results.root)
        );

        expect(diffExpectedWithRoot).toEqual([]);
      });

      it("has a Searches Resource.", function(){
        var resourceType = results.root.searches.resourceType;
        expect(resourceType).toBe('searches');
      });

      it("can find resources by their UUID", function(){
        config.setupTest(tubeTestJson);
        results.root.find("3bcf8010-68ac-0130-9163-282066132de2").done(assignResultTo('tube'));
        expect(results.tube.rawJson).toBeDefined();
      });

    });
  });
});
