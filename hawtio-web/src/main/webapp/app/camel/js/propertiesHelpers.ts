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

    // label in model is for tabs
    angular.forEach(properties, function (property, key) {
      // if there is no label then use common as fallback
      var labels:string[] = ["common"];

      var value = property["label"];
      if (angular.isDefined(value) && value !== null) {
        labels = value.split(",");
      }
      angular.forEach(labels, (label) => {
        var keys:string[] = tabs[label] || [];
        keys.push(key);
        answer[label] = keys;
      });
      // remove label as that causes the UI to render the label instead of the key as title (the label are used for tabs)
      delete property["label"];
    });

    return answer;
  }

  /**
   * Sort the properties tabs in the order we want to display them
   */
  export function sortPropertiesTabs(tabs:{}) : {} {
    // now we need to sort the tabs which is tricky as we need to create an array
    // first which we sort, and then re-create the map from the sorted array

    var sorted = [];
    angular.forEach(tabs, function (value, key) {
      sorted.push({'key': key, 'labels': value});
    });

    // sort the tabs in the order we like:
    // common, consumer, producer, a..z
    sorted = sorted.sort((n1:{}, n2:{}) => {
      // default first
      if (n1['key'] === 'common') {
        return -1;
      } else if (n2['key'] === 'common') {
        return 1;
      }
      // then consumer
      if (n1['key'] === 'consumer') {
        return -1;
      } else if (n2['key'] === 'consumer') {
        return 1;
      }
      // then producer
      if (n1['key'] === 'producer') {
        return -1;
      } else if (n2['key'] === 'producer') {
        return 1;
      }
      // then a..z
      return n1['key'].localeCompare(n2['key']);
    });

    // then re-create the map from the sorted array
    var answer = {};
    angular.forEach(sorted, function (value, key) {
      var name = value['key'];
      var labels = value['labels'];
      answer[name] = labels;
      log.info("Tab(" + name + ") = " + labels);
    });

    return answer;
  }

}

