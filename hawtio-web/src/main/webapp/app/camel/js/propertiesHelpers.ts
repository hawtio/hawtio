/// <reference path="../../baseHelpers.ts"/>
/// <reference path="../../core/js/coreHelpers.ts"/>
/// <reference path="../../core/js/workspace.ts"/>
/**
 * @module Camel
 */
module Camel {

  export var log:Logging.Logger = Logger.get("Camel");

  export function buildTabsFromProperties(tabs:{}, properties:{}) : {} {
    var answer = tabs;

    // group in model is for tabs
    angular.forEach(properties, function (property, key) {

      var group:string = property["group"] || "options";
      if (angular.isDefined(group) && group !== null) {

        var keys:string[] = tabs[group] || [];
        // an option may be listed in more labels so only define it once so we do not repeat it
        if (keys.indexOf(key) === -1) {
          keys.push(key);
        }
        answer[group] = keys;
      }
    });

    return answer;
  }


}

