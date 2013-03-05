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

  var badResources =  {
    "/11111111-2222-3333-4444-555555555555": {
      "tube": {
        "actions": {
          "read": "/66611111-2222-3333-4444-555555555555",
          "create": "/66611111-2222-3333-4444-555555555555",
          "update": "/66611111-2222-3333-4444-555555555555",
          "delete": "/66611111-2222-3333-4444-555555555555"
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
    },
  };

  var stage1 = {
    '/': root,

    "/searches": {
      "search":  {
        "actions":  {
           "read":  "http://localhost:9292/15d67640-6224-0130-7ab9-282066132de2",
          "first":  "http://localhost:9292/15d67640-6224-0130-7ab9-282066132de2/page=1",
           "last":  "http://localhost:9292/15d67640-6224-0130-7ab9-282066132de2/page=-1"
        },
        "uuid": "15d67640-6224-0130-7ab9-282066132de2"
      }
    },

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
    },

    "/11111111-2222-3333-4444-999999999999":  {
      "order": {
        "actions": {
          "create": "/11111111-2222-3333-4444-999999999999",
          "read": "/11111111-2222-3333-4444-999999999999",
          "update": "/11111111-2222-3333-4444-999999999999",
          "delete": "/11111111-2222-3333-4444-999999999999"
        },
        "uuid": "11111111-2222-3333-4444-999999999999",
        "creator": {
          "actions": {
            "create": "/11111111-2222-3333-4444-666666666666",
            "read": "/11111111-2222-3333-4444-666666666666",
            "update": "/11111111-2222-3333-4444-666666666666",
            "delete": "/11111111-2222-3333-4444-666666666666"
          },
          "uuid": "11111111-2222-3333-4444-666666666666"
        },
        "study": {
          "actions": {
            "create": "/11111111-2222-3333-4444-777777777777",
            "read": "/11111111-2222-3333-4444-777777777777",
            "update": "/11111111-2222-3333-4444-777777777777",
            "delete": "/11111111-2222-3333-4444-777777777777"
          },
          "uuid": "11111111-2222-3333-4444-777777777777"
        },
        "pipeline": "pipeline 1",
        "cost_code": "cost code 1",
        "status": "draft",
        "parameters": {},
        "state": {},
        "items": {
          "tube_for_extraction": [
            { "status": "done", "uuid": "11111111-2222-3333-0000-111111111111" }
          ]
        }
      }
    },

    "/searches": {
      "search":{
        "actions":{
          "read": "http://localhost:9292/15d67640-6224-0130-7ab9-282066132de2",
          "first":"http://localhost:9292/15d67640-6224-0130-7ab9-282066132de2/page=1",
          "last": "http://localhost:9292/15d67640-6224-0130-7ab9-282066132de2/page=-1"
        },
        "uuid":   "15d67640-6224-0130-7ab9-282066132de2"
      }
    },

    "/15d67640-6224-0130-7ab9-282066132de2/page=1": {
      "actions":{
        "read": "http://localhost:9292/tubes/page=1",
        "first":"http://localhost:9292/tubes/page=1",
        "last": "http://localhost:9292/tubes/page=-1"
      },
      "size":   1,
      "tubes":  [
        {
        "tube":{
          "actions":   {
            "read":  "http://localhost:9292/106d61c0-6224-0130-90b6-282066132de2",
            "create":"http://localhost:9292/106d61c0-6224-0130-90b6-282066132de2",
            "update":"http://localhost:9292/106d61c0-6224-0130-90b6-282066132de2",
            "delete":"http://localhost:9292/106d61c0-6224-0130-90b6-282066132de2"
          },
          "uuid":      "106d61c0-6224-0130-90b6-282066132de2",
          "type":      null,
          "max_volume":null,
          "aliquots":  [
            {
            "quantity":1000,
            "type":    "NA+P",
            "unit":    "mole"
          }
          ],
          "labels":    {
            "actions":{
              "read":  "http://localhost:9292/106d7130-6224-0130-90b6-282066132de2",
              "create":"http://localhost:9292/106d7130-6224-0130-90b6-282066132de2",
              "update":"http://localhost:9292/106d7130-6224-0130-90b6-282066132de2",
              "delete":"http://localhost:9292/106d7130-6224-0130-90b6-282066132de2"
            },
            "uuid":   "106d7130-6224-0130-90b6-282066132de2",
            "barcode":{
              "value":"XX333333K",
              "type": "sanger-barcode"
            }
          }
        }
      }
      ]

    }

  };

  var stage2 = $.extend(stage1, {
    "/11111111-2222-3333-4444-999999999999":  {
      "order": {
        "actions": {
          "create": "/11111111-2222-3333-4444-999999999999",
          "read": "/11111111-2222-3333-4444-999999999999",
          "update": "/11111111-2222-3333-4444-999999999999",
          "delete": "/11111111-2222-3333-4444-999999999999"
        },
        "uuid": "11111111-2222-3333-4444-999999999999",
        "creator": {
          "actions": {
            "create": "/11111111-2222-3333-4444-666666666666",
            "read": "/11111111-2222-3333-4444-666666666666",
            "update": "/11111111-2222-3333-4444-666666666666",
            "delete": "/11111111-2222-3333-4444-666666666666"
          },
          "uuid": "11111111-2222-3333-4444-666666666666"
        },
        "study": {
          "actions": {
            "create": "/11111111-2222-3333-4444-777777777777",
            "read": "/11111111-2222-3333-4444-777777777777",
            "update": "/11111111-2222-3333-4444-777777777777",
            "delete": "/11111111-2222-3333-4444-777777777777"
          },
          "uuid": "11111111-2222-3333-4444-777777777777"
        },
        "pipeline": "pipeline 1",
        "cost_code": "cost code 1",
        "status": "draft",
        "parameters": {},
        "state": {},
        "items": {
          "tube_for_extraction": [
            { "status": "done", "uuid": "11111111-2222-3333-0000-111111111111" }
          ],
          "binding_spin_column": [
            { "status": "pending", "uuid": "22222222-2222-3333-4444-555555555555" }
          ]
        }
      }
    },

    "/22222222-2222-3333-4444-555555555555":  {
      "spin_column": {
        "actions": {
          "read": "/22222222-2222-3333-4444-555555555555",
          "create": "/22222222-2222-3333-4444-555555555555",
          "update": "/22222222-2222-3333-4444-555555555555",
          "delete": "/22222222-2222-3333-4444-555555555555"
        },
        "uuid": "22222222-2222-3333-4444-555555555555",
        "aliquots": []
      }
    }
  });

  return {
    badResources: badResources,
    stage1: stage1,
    stage2: stage2
  };
});

