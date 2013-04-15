define([
  'resource_test_helper'
  , 'config'
  , 'text!/json/unit/test_config_data.json'
], function (TestHelper, config, minidb) {

  'use strict';

  TestHelper(function (results) {

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
        runs(function () {
          config.ajax(put1Call)
              .then(results.expected)
              .fail(results.unexpected);
        });
        waitsFor(results.hasFinished);

        runs(function () {
          return expect(config.progress).toHaveBeenCalled();
        });

      });

      it("testData is complete", function () {
        runs(function () {
          expect(config.testData["default"]).toBeDefined();
          expect(config.testData["after"]).toBeDefined();
          expect(config.testData["even_later"]).toBeDefined();
        });
      });

      it("changes the hashedData when changing stage.", function () {
        var key = "GET:/";
        results.resetFinishedFlag();
        expect(config.hashedTestData[key].response.value).toEqual(0);
        runs(function () {
          config.ajax(put1Call)
              .then(results.expected)
              .fail(results.unexpected);
        });
        waitsFor(results.hasFinished);

        runs(function () {
          expect(config.hashedTestData[key].response.value).toEqual(1);
        });

        runs(function () {
          results.resetFinishedFlag();
          config.ajax(put1Call)
              .then(results.expected)
              .fail(results.unexpected);
        });
        waitsFor(results.hasFinished);

        runs(function () {
          expect(config.hashedTestData[key].response.value).toEqual(2);
        });
      });

      it("changes the hashedData when changing stage, regardless of the call order.", function () {
        var key = "GET:/";
        expect(config.hashedTestData[key].response.value).toEqual(0);

        results.resetFinishedFlag();
        expect(config.hashedTestData[key].response.value).toEqual(0);
        runs(function () {
          config.ajax(put2Call)
              .then(results.expected)
              .fail(results.unexpected);
        });
        waitsFor(results.hasFinished);

        runs(function () {
          expect(config.hashedTestData[key].response.value).toEqual(2);
        });

        runs(function () {
          results.resetFinishedFlag();
          config.ajax(put1Call)
              .then(results.expected)
              .fail(results.unexpected);
        });
        waitsFor(results.hasFinished);

        runs(function () {
          expect(config.hashedTestData[key].response.value).toEqual(1);
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

        var responseSearchCall;

        runs(function () {
          results.resetFinishedFlag();
          config.ajax(searchCall)
              .then(results.assignTo('response'))
              .then(results.expected)
              .fail(results.unexpected);
        });
        waitsFor(results.hasFinished);

        runs(function () {
          responseSearchCall = results.get('response');
          expect(responseSearchCall).toBeDefined();
          expect(responseSearchCall["responseText"]).toBeDefined();
          expect(responseSearchCall["responseText"]["search"]).toBeDefined();
          expect(responseSearchCall["responseText"]["search"]["actions"]).toBeDefined();
          expect(responseSearchCall["responseText"]["search"]["actions"]["first"]).toBeDefined();

        });

        runs(function () {

          var URL_FOR_NO_RESULT = responseSearchCall["responseText"]["search"]["actions"]["first"];
          var resultCall = {
            type:'GET',
            url:URL_FOR_NO_RESULT,
            dataType:"json",
            headers:{ 'Content-Type':'application/json' },
            data:""
          };

          results.resetFinishedFlag();
          config.ajax(resultCall)
              .then(results.assignTo('response'))
              .then(results.expected)
              .fail(results.unexpected);
        });
        waitsFor(results.hasFinished);

        runs(function () {
          var responseNoResult = results.get('response');
          expect(responseNoResult).toBeDefined();
          expect(responseNoResult["responseText"]).toBeDefined();
          expect(responseNoResult["responseText"]["size"]).toBeDefined();
          expect(responseNoResult["responseText"]["size"]).toEqual(0);
        });
      });

    });

  });
});