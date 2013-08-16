define([
  'resource_test_helper'
  , 'config'
  , 'text!test/json/unit/test_config_data.json'
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

      it("changes the current stage when sending a 'PUT'.", function (done) {
        var spy = sinon.spy(config, "progress");
        config.ajax(put1Call)
            .then(function() {
              results.expected();
              expect(spy).to.have.been.called;
            })
            .fail(results.unexpected)
            .always(done);
      });

      it("testData is complete", function () {
          expect(config.testData["default"]).to.be.defined;
          expect(config.testData["after"]).to.be.defined;
          expect(config.testData["even_later"]).to.be.defined;
      });

      it("changes the hashedData when changing stage.", function (done) {
        var key = "GET:/";
        
        results.resetFinishedFlag();
        
        expect(config.hashedTestData[key].response.value).to.equal(0);
        
        function firstCall() {
          return config.ajax(put1Call)
            .then(function() { 
              expect(config.hashedTestData[key].response.value).to.equal(1); 
            })
            .fail(results.unexpected);
        }

        function secondCall() {
          return config.ajax(put1Call)
            .then(function() {
              expect(config.hashedTestData[key].response.value).to.equal(2); 
            })
            .fail(results.unexpected);
        }

        firstCall()
          .then(secondCall)
          .fail(results.unexpected)
          .always(done);
      });

      it("changes the hashedData when changing stage, regardless of the call order.", function (done) {
        var key = "GET:/";
        
        expect(config.hashedTestData[key].response.value).to.equal(0);

        function firstCall() {
          return config.ajax(put2Call)
                  .then(function() { 
                    expect(config.hashedTestData[key].response.value).to.equal(2); 
                  });
        };

        function secondCall() { 
          return config.ajax(put1Call)
            .then(function() { 
              expect(config.hashedTestData[key].response.value).to.equal(1); 
            });
        };

        firstCall()
          .then(secondCall)
          .fail(results.unexpected)
          .always(done);
      });

      it("return an empty thing when a search fails.", function (done) {

        var responseToFirstSearch;

        function firstCall() {
          var searchCall = {
            type:'POST',
            url:'/lims-laboratory/searches',
            dataType:"json",
            headers:{ 'Content-Type':'application/json' },
            data:{ 'what':'something impossible to find' }
          };

          return config.ajax(searchCall)
                  .then(function(responseSearchCall) {
                    responseToFirstSearch = responseSearchCall;
                    expect(responseSearchCall).to.be.defined;
                    expect(responseSearchCall["responseText"]).to.be.defined;
                    expect(responseSearchCall["responseText"]["search"]).to.be.defined;
                    expect(responseSearchCall["responseText"]["search"]["actions"]).to.be.defined;
                    expect(responseSearchCall["responseText"]["search"]["actions"]["first"]).to.be.defined;
                  });
        }
                
        function secondCall() {
          var URL_FOR_NO_RESULT = responseToFirstSearch["responseText"]["search"]["actions"]["first"];

          var resultCall = {
            type:'GET',
            url:URL_FOR_NO_RESULT,
            dataType:"json",
            headers:{ 'Content-Type':'application/json' },
            data:""
          };

          return config.ajax(resultCall)
                  .then(function(responseNoResult) {
                    expect(responseNoResult).to.be.defined;
                    expect(responseNoResult["responseText"]).to.be.defined;
                    expect(responseNoResult["responseText"]["size"]).to.be.defined;
                    expect(responseNoResult["responseText"]["size"]).to.equal(0);
                  });
        };
        
        firstCall()
          .then(secondCall)
          .fail(results.unexpected)
          .always(done);

      });
      
    });

  });
});