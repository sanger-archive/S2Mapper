define([
  'config'
  , 'text!/json/unit/test_config_data.json'
], function (config, minidb) {

  'use strict';

  describe("the fake ajax call", function () {
    var putCall = {
      type:'PUT',
      url:'/',
      dataType:"json",
      headers:{ 'Content-Type':'application/json' },
      data:""
    };

    beforeEach(function () {
      config.loadTestData(minidb);
    });

    it("changes the current stage when sending a 'PUT'.", function () {
      spyOn(config, "progress").andCallThrough();
      config.ajax(putCall)
          .then(function () {
            return expect(config.progress).toHaveBeenCalled();
          }).fail(function () {
            throw "oops";
          });
    });

    it("changes the hashedData when changing stage.", function () {
      var key = "GET:/";
      expect(config.hashedTestData[key].value).toEqual(0);
      config.ajax(putCall)
          .then(function () {
            expect(config.hashedTestData[key].value).toEqual(1);
            return config.ajax(putCall)
          })
          .then(function () {
            expect(config.hashedTestData[key].value).toEqual(2);
          }).fail(function () {
            throw "oops";
          });
    });

    it("return an empty thing when a search fails.", function () {
      var searchCall = {
        type:'POST',
        url:'/searches',
        dataType:"json",
        headers:{ 'Content-Type':'application/json' },
        data:{ 'what':'something impossible to find' }
      };

      config.ajax(searchCall)
          .then(function (response) {
            expect(response).toBeDefined();
            expect(response["responseText"]).toBeDefined();
            expect(response["responseText"]["search"]).toBeDefined();
            expect(response["responseText"]["search"]["actions"]).toBeDefined();
            expect(response["responseText"]["search"]["actions"]["first"]).toBeDefined();

            var URL_FOR_NO_RESULT = response["responseText"]["search"]["actions"]["first"];

            var resultCall = {
              type:'GET',
              url:URL_FOR_NO_RESULT,
              dataType:"json",
              headers:{ 'Content-Type':'application/json' },
              data:""
            };

            return config.ajax(resultCall);
          })
          .then(function (response) {
            expect(response).toBeDefined();
            expect(response["responseText"]).toBeDefined();
            expect(response["responseText"]["size"]).toBeDefined();
            expect(response["responseText"]["size"]).toEqual(0);

          }).fail(function () {
            throw "oops";
          });
    });

  });

});
