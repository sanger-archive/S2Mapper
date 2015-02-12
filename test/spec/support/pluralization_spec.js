//This file is part of S2 and is distributed under the terms of GNU General Public License version 1 or later;
//Please refer to the LICENSE and README files for information on licensing and authorship of this file.
//Copyright (C) 2013 Genome Research Ltd.
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
          expect(singular.pluralize()).to.equal(plural);
        });
      }
    });
    describe('singularize', function() {
      for (var singular in pluralizations) {
        var plural = pluralizations[singular];

        it("singularizes '" + plural + "' to '" + singular + "'", function() {
          expect(plural.singularize()).to.equal(singular);
        });
      }
    });
    describe('hyphenToCamel', function() {
      for (var camel in hyphens) {
        var hyphen = hyphens[camel];

        it("camels '" + hyphen + "' to '" + camel + "'", function() {
          expect(hyphen.removeHyphen()).to.equal(camel);
        });
      }
    });
  });
});
