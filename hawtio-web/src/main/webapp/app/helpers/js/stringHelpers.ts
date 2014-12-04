/// <reference path="../../baseIncludes.ts"/>
module StringHelpers {

  var dateRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:/i;

  export function isDate(str:any) {
    if (!angular.isString(str)) {
      // we only deal with strings
      return false;
    }
    return dateRegex.test(str);
  }

  /**
   * Convert a string into a bunch of '*' of the same length
   * @param str
   * @returns {string}
   */
  export function obfusicate(str:String):String {
    if (!angular.isString(str)) {
      // return null so we don't show any old random non-string thing
      return null;
    }
    return str.chars().map((c) => { return '*'; }).join('');
  }

  /**
   * Simple toString that obscures any field called 'password'
   * @param obj
   * @returns {string}
   */
  export function toString(obj:any) {
    if (!obj) {
      return '{ null }';
    }
    var answer = <Array<String>>[];
    angular.forEach(obj, (value:any, key:String) => {
      var val = value;
      if (('' + key).toLowerCase() === 'password') {
        val = StringHelpers.obfusicate(value);
      } else if (angular.isObject(val)) {
        val = toString(val);
      }
      answer.push(key + ': ' + val);
    });
    return '{ ' + answer.join(', ') + ' }';
  }



}
