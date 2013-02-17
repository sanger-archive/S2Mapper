define([], function (s2) {
  "use strict";

  // S2Resource is a fatory function returning the matching resource type
  // from a jquery response callback. E.g. Tube, Spin Column or Search
  // .done(S2Resource)
  var S2Resource = function (response){
  };

  var S2Resource = function (type, node) {
    var action;
    if (!node.uuid) {
      delete (this);
      return false;
    }
    this.rawJson = node;
    switch (type) {
      case 'tube':
        this.resourceType = 'tube';
      parseAliquots(this, node);
      break;
      case 'spin_columns':
        this.resourceType = 'spinColumn';
      parseAliquots(this.node);
      break;
      case 'sample':
        this.resourceType = 'sample';
      break;
    }
    for (action in node.actions) {
      this[action] = function (sendData) {
        s2ajax.send(action, node.actions[action], sendData, null);
      };
    }
    if (!s2.resources[node.uuid]) {
      s2.resources[node.uuid] = this;
    }
    $.extend(true, s2.resources[node.uuid], this);
    s2.emit({event:'resourceUpdated', data:this});
    return this;
  };
  function parseAliquots(resource, node) {
    resource.aliquots = {};
    for (var aliquot in node.aliquots) {
      for (var contents in node.aliquots[aliquot]) {
        if (node.aliquots[aliquot][contents].uuid) {
          resource.aliquots[node.aliquots[aliquot][contents].uuid] = new S2resource(contents, node.aliquots[aliquot][contents])
        }
      }
    }
    return resource;
  }

  return S2resource;
});

