define(['mapper/support/pluralization'], function() {
  'use strict';

  describe('String.prototype', function() {
    var pluralizations = {
      'bunny':  'bunnies',
      'search': 'searches',
      'word':   'words'
    };

    var hyphens = {
      'laboratorySearch': 'laboratory-search',
      'multiWordSample': 'multi-word-sample',
      'oneword': 'oneword'
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
    describe('hyphenToCamel', function() {
      for (var camel in hyphens) {
        var hyphen = hyphens[camel];

        it("camels '" + hyphen + "' to '" + camel + "'", function() {
          expect(hyphen.removeHyphen()).toBe(camel);
        });
      }
    });
  });
});
