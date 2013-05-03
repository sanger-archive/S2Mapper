/*
 * Adds two methods to the String.prototype to allow for manipulation of plurality:
 *
 * pluralize - attempts to pluralize the word
 * singularize - attempts to singularize the word
 *
 * These are rule based and may not always get the right answer!
 */
define([], function() {
  'use strict';

  /*
   * Utility function for construction regex based rules:
   *
   * pluralizeRegex   - regex string for detecting whether the rule applies to the word for puralization;
   * pluralEnding     - the ending to be added should the pluralization match;
   * singularizeRegex - regex string for detecting whether the rule applies for singularization;
   * singularEnding   - the ending to be added should the singularization match;
   * failure          - callback that takes a string and returns the result should the rule not match.
   *
   * Both pluralizeRegex and singularizeRegex are expected to contain a match group at position 1 for the
   * word that should either be added to or returned as the removal.  Note that singularization could
   * involve changing the ending of the word (y => ies => y).
   */
  function RegexEnding(pluralizeRegex, pluralEnding, singularizeRegex, singularEnding, failure) {
    function Handler(regex, ending) {
      return function(string) {
        var match = string.match(regex);
        if (match != null) return [true,match[1]+ending];
        return failure(string);
      };
    }

    return {
      pluralize:   Handler(new RegExp(pluralizeRegex, 'i'),   pluralEnding),
      singularize: Handler(new RegExp(singularizeRegex, 'i'), singularEnding)
    };
  }

  function passThroughToNextRule(string) { return [false,null]; }

  var rules = [
    // Words ending in 'y' change to 'ies' and so words ending in 'ies' change to 'y'
    RegexEnding('^(.+)y$', 'ies', '^(.+)ies$', 'y', passThroughToNextRule),

    // Words ending in 'h' add 'es' and so words ending in 'hes' remove the 'es'
    RegexEnding('^(.+h)$', 'es', '^(.+h)es$', '', passThroughToNextRule),

    // Final, and simplest, of all rules: simply add or remove the missing 's' from the end of the word!
    RegexEnding('^(.+[^s])?$', 's', '^(.+)s$', '', function(string) { return [true,string.toString()]; })
  ];

  function endingManipulator(direction) {
    return function() {
      for (var r = 0; r < rules.length; r++) {
        var result = rules[r][direction](this);
        if (result[0]) { return result[1]; }
      }
      throw 'Reached the end of the rules for ' + direction + '!';
    };
  }

  String.prototype.hyphenToCamel = function(){
    var str = this;

    // Match all hyphens in the string and the following first letter of the next word
    var matches = str.match(/(-[a-z])/gi);

    // Replace all hyphens and first letter of the following word to upper case
    _.each(matches, function(match) {
      var replace = match.match(/[a-z]/)[0].toUpperCase();
      str = str.replace(match, replace);
    });

    return str;
  }

  String.prototype.singularize = endingManipulator('singularize');
  String.prototype.pluralize   = endingManipulator('pluralize');
  return String;
});
