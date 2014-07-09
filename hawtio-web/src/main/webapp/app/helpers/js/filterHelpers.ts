module FilterHelpers {

  /**
   * Tests if an object contains the text in "filter".  The function
   * only checks the values in an object and ignores keys altogether,
   * can also work with strings/numbers/arrays
   * @param object
   * @param filter
   * @returns {boolean}
   */
  export function searchObject(object:any, filter:string):boolean {
    var answer = false;
    if (angular.isString(object)) {
      answer = (<string>object).has(filter);
    } else if (angular.isNumber(object)) {
      answer = ("" + object).has(filter);
    } else if (angular.isArray(object)) {
      answer = (<Array<any>>object).some((item) => {
        return searchObject(item, filter);
      });
    } else if (angular.isObject(object)) {
      answer = searchObject(Object.extended(object).values(), filter);
    }
    return answer;
  }

}
