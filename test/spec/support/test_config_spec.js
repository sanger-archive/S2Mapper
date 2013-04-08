define([
  'config'
  , 'text!/json/unit/test_config_data.json'
], function (config, minidb) {

  'use strict';

  describe("the fake ajax call", function () {
    var put1Call = {
      type:'PUT',
      url:'/1',
      dataType:"json",
      headers:{ 'Content-Type':'application/json' },
      data:""
    };
    var put2Call = {
      type:'PUT',
      url:'/2',
      dataType:"json",
      headers:{ 'Content-Type':'application/json' },
      data:""
    };

    beforeEach(function () {
      config.loadTestData(minidb);
    });

    it("changes the current stage when sending a 'PUT'.", function () {
      spyOn(config, "progress").andCallThrough();
      config.ajax(put1Call)
          .then(function () {
            return expect(config.progress).toHaveBeenCalled();
          }).fail(function () {
            throw "oops";
          });
    });


    it("testData is complete", function () {
      expect(config.testData["default"]).toBeDefined();
      expect(config.testData["after"]).toBeDefined();
      expect(config.testData["even_later"]).toBeDefined();
    });

    it("changes the hashedData when changing stage.", function () {
      var key = "GET:/";
      expect(config.hashedTestData[key].response.value).toEqual(0);
      config.ajax(put1Call)
          .then(function () {
            expect(config.hashedTestData[key].response.value).toEqual(1);
            return config.ajax(put1Call)
          })
          .then(function () {
            expect(config.hashedTestData[key].response.value).toEqual(2);
          }).fail(function () {
            throw "oops";
          });
    });

    it("changes the hashedData when changing stage, regardless of the call order.", function () {
      var key = "GET:/";
      expect(config.hashedTestData[key].response.value).toEqual(0);
      config.ajax(put2Call)
          .then(function () {
            expect(config.hashedTestData[key].response.value).toEqual(2);
            return config.ajax(put1Call)
          })
          .then(function () {
            expect(config.hashedTestData[key].response.value).toEqual(1);
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
