define([],function(){
  'use stirct';

  var root = {
    "tubes": {
      "actions": {
        "create":  "/tubes",
        "read":    "/tubes",
        "first":   "/tubes/page=1",
        "last":    "/tubes/page=-1"
      }
    },
    "tube_racks": {
      "actions": {
        "create":  "/tube_racks",
        "read":    "/tube_racks",
        "first":   "/tube_racks/page=1",
        "last":    "/tube_racks/page=-1"
      }
    },
    "create_tubes": {
      "actions": {
        "create":  "/actions/create_tube"
      }
    },
    "create_tube_racks": {
      "actions": {
        "create":  "/actions/create_tube_rack"
      }
    },
    "tube_rack_moves": {
      "actions": {
        "create":  "/actions/tube_rack_move"
      }
    },
    "tube_rack_transfers": {
      "actions": {
        "create":  "/actions/tube_rack_transfer"
      }
    },
    "searches": {
      "actions": {
        "create": "http://localhost:9292/searches",
        "read": "http://localhost:9292/searches",
        "first": "http://localhost:9292/searches/page=1",
        "last": "http://localhost:9292/searches/page=-1"
      }
    }

  };

  var stage1 = {
    '/': root,

    "/11111111-2222-3333-4444-555555555555": {
      "tube": {
        "actions": {
          "read": "/11111111-2222-3333-4444-555555555555",
          "create": "/11111111-2222-3333-4444-555555555555",
          "update": "/11111111-2222-3333-4444-555555555555",
          "delete": "/11111111-2222-3333-4444-555555555555"
        },
        "uuid": "11111111-2222-3333-4444-555555555555",
        "aliquots": [{
          "sample": {
            "actions": {
              "read": "/11111111-2222-3333-4444-666666666666",
              "create": "/11111111-2222-3333-4444-666666666666",
              "update": "/11111111-2222-3333-4444-666666666666",
              "delete": "/11111111-2222-3333-4444-666666666666"
            },
            "uuid": "11111111-2222-3333-4444-666666666666",
            "name": "sample 1"
          },
          "quantity": 10,
          "type": "DNA",
          "unit": "mole"
        }]
      }
    }
  };

  return {
    root: root,
    stage1: stage1
  };
});

