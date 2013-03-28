define(['mapper/s2_base_resource'], function(BaseResource){
  'use strict';

  describe('S2BaseResource', function(){
    describe("findByEan13Barcode", function(){
      var callFindByEan13Barcode = function(){
        BaseResource.findByEan13Barcode('1234567890123');
      };

      it("throws an exception if findByEan13Barcode is called on it directly", function(){
        expect(callFindByEan13Barcode).toThrow();
      });
    });

    describe("BaseResource#new()", function(){
      it("returns an unsaved BaseResource.", function(){
        expect(BaseResource.new()).toBeDefined();
      });
    });

    describe('register', function() {
      it("calls back with the resourceType", function() {
        var resource = {};
        $.extend(resource, BaseResource);
        resource.resourceType = 'foo';

        var registry = {};
        resource.register(function(name,value) { registry[name] = value; });

        expect(registry['foo']).toBe(resource);
      });
    });

    describe('extendAs', function() {
      var model;

      beforeEach(function() {
        model = BaseResource.extendAs('foo');
      });

      it('configures the resourceType', function() {
        expect(model.resourceType).toBe('foo');
      });

      it('ensures instances have the correct type', function() {
        expect(model.new().resourceType).toBe('foo');
      });

      it('ensures instances have actions', function() {
        expect(model.new().actions).toEqual({});
      });

      it('can change the rawJson in the background', function() {
        var instance = model.new({rawJson:{foo:{uuid: 'bar'}}});
        expect(instance.uuid).toEqual('bar');
        instance.rawJson.foo.uuid = 'foobar';
        expect(instance.uuid).toEqual('foobar');
      });
    });

    describe("actions", function() {
      var resource, root;

      beforeEach(function() {
        root = {
          user: 'user',
          retrieve: function() { }
        };
        spyOn(root, 'retrieve');

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

      function requestArg(arg) { return root.retrieve.mostRecentCall.args[0][arg]; }
      function requestBody()   { return requestArg('data'); }

      function updatesState(name, method, url) {
        describe(name, function() {
          describe("with no body specified", function() {
            beforeEach(function() {
              resource[name]();
            });

            it("uses the " + method + " method", function() {
              expect(requestArg('sendAction')).toEqual(method);
            });

            it("uses the " + method + " URL", function() {
              expect(requestArg('url')).toEqual(url);
            });

            it("does not wrap the content in an element", function() {
              expect(_.keys(requestBody())).toNotContain(resource.resourceType);
            });

            it("sets the user at the top level", function() {
              expect(_.keys(requestBody())).toContain('user');
            });
          });

          describe("with body specified", function() {
            beforeEach(function() {
              resource[name]({body:'here'});
            });

            it("does not wrap the content in an element", function() {
              expect(_.keys(requestBody())).toNotContain(resource.resourceType);
            });

            it("ensures that the body is present", function() {
              expect(_.keys(requestBody())).toContain('body');
            });

            it("sets the user at the top level", function() {
              expect(_.keys(requestBody())).toContain('user');
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
            expect(requestArg('sendAction')).toEqual(method);
          });

          it("uses the " + method + " URL", function() {
            expect(requestArg('url')).toEqual(url);
          });

          it("does not send a body", function() {
            expect(requestBody()).toBeUndefined();
          });

          it("does not send a body", function() {
            resource[name]({body: 'foo'});
            expect(requestBody()).toBeUndefined();
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
            expect(requestArg('sendAction')).toEqual('create');
          });

          it("uses the create URL", function() {
            expect(requestArg('url')).toEqual('http://localhost:9292/post');
          });

          it("wraps the content in the resource type", function() {
            expect(_.keys(requestBody())).toContain(resource.resourceType);
          });

          it("sets the user at the child level", function() {
            expect(_.keys(requestBody()[resource.resourceType])).toContain('user');
          });
        });

        describe("with body specified", function() {
          beforeEach(function() {
            resource.create({body:'here'});
          });

          it("wraps the content in the resource type", function() {
            expect(_.keys(requestBody())).toContain(resource.resourceType);
          });

          it("ensures that the body is present", function() {
            expect(_.keys(requestBody()[resource.resourceType])).toContain('body');
          });

          it("sets the user at the child level", function() {
            expect(_.keys(requestBody()[resource.resourceType])).toContain('user');
          });
        });
      });
    });
  });
});
