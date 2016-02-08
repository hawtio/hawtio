/// <reference path="../../baseIncludes.ts"/>
/**
 * Module that provides functions related to working with javascript objects
 */
module ObjectHelpers {

  /**
   * Convert an array of 'things' to an object, using 'index' as the attribute name for that value
   * @param arr
   * @param index
   * @param decorator
   */
  export function toMap(arr:Array<any>, index:string, decorator?:(any) => void):any {
    if (!arr || arr.length === 0) {
      return {};
    }
    var answer = {};
    arr.forEach((item) => {
      if (angular.isObject(item)) {
        answer[item[index]] = item;
        if (angular.isFunction(decorator)) {
          decorator(item);
        }
      }
    });
    return answer;
  }
}
