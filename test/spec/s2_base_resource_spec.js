define(['mapper/s2_base_resource'], function(BaseResource){
  'use strict';

  describe('S2BaseResource', function(){
    describe("findByEan13Barcode", function(){
      var callFindByEan13Barcode = function(){
        BaseResource.findByEan13Barcode('1234567890123');
      };

      it("throws an exception if findByEan13Barcode is called on it directly", function(){
        expect(callFindByEan13Barcode).to.throw();
      });
    });

    describe("BaseResource#new()", function(){
      it("returns an unsaved BaseResource.", function(){
        expect(BaseResource.new()).to.be.defined;
      });
    });

    describe('extendAs', function() {
      describe('with individual name', function() {
        var model;

        beforeEach(function() {
          model = BaseResource.extendAs('foo');
        });

        it('configures the resourceType', function() {
          expect(model.resourceType).to.equal('foo');
        });

        it('ensures instances have the correct type', function() {
          expect(model.new().resourceType).to.equal('foo');
        });

        it('ensures instances have actions', function() {
          expect(model.new().actions).to.eql({});
        });

        it('can change the rawJson in the background', function() {
          var instance = model.new({rawJson:{foo:{uuid: 'bar'}}});
          expect(instance.uuid).to.equal('bar');
          instance.rawJson.foo.uuid = 'foobar';
          expect(instance.uuid).to.equal('foobar');
        });

        describe('register', function() {
          it('registers under the singular name', function() {
            var registry = {};
            model.register(function(name,value) { registry[name] = value; });

            expect(registry['foo']).to.eql(model);
          });
        });
      });

      describe('with multiple names', function() {
        var model;

        beforeEach(function() {
          model = BaseResource.extendAs(['type', 'name1', 'name2']);
        });

        it('configures the resourceType', function() {
          expect(model.resourceType).to.equal('type');
        });

        describe('register', function() {
          it('registers under the multiple names', function() {
            var registry = {};
            model.register(function(name,value) { registry[name] = value; });

            expect(registry['name1']).to.eql(model);
            expect(registry['name2']).to.eql(model);
          });

          it('does not register under the type', function() {
            var registry = {};
            model.register(function(name,value) { registry[name] = value; });

            expect(registry['type']).to.be.undefined;
          });
        });
      });
    });

    describe("actions", function() {
      var resource, root, spy;

      beforeEach(function() {
        root = {
          user: 'user',
          retrieve: function() { }
        };
        
        spy = sinon.spy(root, 'retrieve');

        resource = BaseResource.extendAs('foo').new({
          root: root,
          rawJson: {
            foo: {
              actions: {
                create: 'http://localhost:9292/post',
                read:   'http://localhost:9292/get',
                update: 'http://localhost:9292/put',
                delete: 'http://localhost:9292/delete',

                first:  'http://localhost:9292/first',
                last:  'http://localhost:9292/last',
              }
            }
          }
        });
      });

      afterEach(function() {
        root.retrieve.restore();
      })

      function requestArg(arg) { return spy.lastCall.args[0][arg] }
      function requestBody()   { return requestArg('data'); }

      function updatesState(name, method, url) {
        describe(name, function() {
          describe("with no body specified", function() {
            beforeEach(function() {
              resource[name]();
            });

            it("uses the " + method + " method", function() {
              expect(requestArg('sendAction')).to.equal(method);
            });

            it("uses the " + method + " URL", function() {
              expect(requestArg('url')).to.equal(url);
            });

            it("does not wrap the content in an element", function() {
              expect(_.keys(requestBody())).to.not.contain(resource.resourceType);
            });

            it("sets the user at the top level", function() {
              expect(_.keys(requestBody())).to.contain('user');
            });
          });

          describe("with body specified", function() {
            beforeEach(function() {
              resource[name]({body:'here'});
            });

            it("does not wrap the content in an element", function() {
              expect(_.keys(requestBody())).to.not.contain(resource.resourceType);
            });

            it("ensures that the body is present", function() {
              expect(_.keys(requestBody())).to.contain('body');
            });

            it("sets the user at the top level", function() {
              expect(_.keys(requestBody())).to.contain('user');
            });
          });
        });
      }

      function idempotent(name, method, url) {
        describe(name, function() {
          beforeEach(function() {
            resource[name]();
          });

          it("uses the " + method + " method", function() {
            expect(requestArg('sendAction')).to.equal(method);
          });

          it("uses the " + method + " URL", function() {
            expect(requestArg('url')).to.equal(url);
          });

          it("does not send a body", function() {
            expect(requestBody()).to.be.undefined;
          });

          it("does not send a body", function() {
            resource[name]({body: 'foo'});
            expect(requestBody()).to.be.undefined;
          });
        });
      }

      updatesState('update', 'update', 'http://localhost:9292/put');
      updatesState('delete', 'delete', 'http://localhost:9292/delete');
      idempotent('read', 'read', 'http://localhost:9292/get');
      idempotent('first', 'first', 'http://localhost:9292/first');
      idempotent('last', 'last', 'http://localhost:9292/last');

      describe("create", function() {
        describe("with no body specified", function() {
          beforeEach(function() {
            resource.create();
          });

          it("uses the create method", function() {
            expect(requestArg('sendAction')).to.equal('create');
          });

          it("uses the create URL", function() {
            expect(requestArg('url')).to.equal('http://localhost:9292/post');
          });

          it("wraps the content in the resource type", function() {
            expect(_.keys(requestBody())).to.contain(resource.resourceType);
          });

          it("sets the user at the child level", function() {
            expect(_.keys(requestBody()[resource.resourceType])).to.contain('user');
          });
        });

        describe("with body specified", function() {
          beforeEach(function() {
            resource.create({body:'here'});
          });

          it("wraps the content in the resource type", function() {
            expect(_.keys(requestBody())).to.contain(resource.resourceType);
          });

          it("ensures that the body is present", function() {
            expect(_.keys(requestBody()[resource.resourceType])).to.contain('body');
          });

          it("sets the user at the child level", function() {
            expect(_.keys(requestBody()[resource.resourceType])).to.contain('user');
          });
        });
      });
    });
  });
});
