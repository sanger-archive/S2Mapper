define([], function(){
  'use strict';
  var Class = function(parent) {
    var klass = function(){
      this.init.apply(this, arguments);
    };

    klass.prototype.init = function(){};

    // jQuery style shortcut for prototype
    klass.fn = klass.prototype;

    klass.fn.parent = klass;

    // Add functions to klass
    klass.extend = function(obj){
      var extended = obj.extended;
      $.extend(klass, obj)
      if (extended) extended[klass];
    };

    // Add method to instances of klass
    klass.include = function(obj){
      var included = obj.included;
      $.extend(klass.fn, obj)
      if (included) included[klass];
    };

    return klass;
  };

  return Class;
});
