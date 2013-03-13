define(['mapper/support/pluralization'], function() {
  'use strict';

  describe('String.prototype', function() {
    var pluralizations = {
      'bunny':  'bunnies',
      'search': 'searches',
      'word':   'words'
    };

    describe('pluralize', function() {
      for (var singular in pluralizations) {
        var plural = pluralizations[singular];

        it("pluralizes '" + singular + "' to '" + plural + "'", function() {
          expect(singular.pluralize()).toBe(plural);
        });
      }
    });
    describe('singularize', function() {
      for (var singular in pluralizations) {
        var plural = pluralizations[singular];

        it("singularizes '" + plural + "' to '" + singular + "'", function() {
          expect(plural.singularize()).toBe(singular);
        });
      }
    });
  });
});
