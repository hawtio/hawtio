/// <reference path="../../baseHelpers.ts"/>
/// <reference path="../../core/js/coreHelpers.ts"/>
/// <reference path="../../core/js/workspace.ts"/>
/**
 * @module Camel
 */
module Camel {

  export var log:Logging.Logger = Logger.get("Camel");

  export function buildTabsFromProperties(tabs:{}, properties:{}, consumerOnly:boolean, producerOnly:boolean):{} {
    var answer = tabs;

    // label in model is for tabs
    angular.forEach(properties, function (property, key) {
      // if there is no label then use common as fallback
      var label:string = "common";
      if (consumerOnly) {
        label = "consumer";
      } if (producerOnly) {
        label = "producer";
      }

      var value:string = property["label"];
      if (angular.isDefined(value) && value !== null) {

        // we want to put advanced into own tab, so look for a label that has advanced as prefix
        // x,advanced => x (advanced)
        var pattern = /(\w),(advanced)/;
        value = value.replace(pattern, '$1 (advanced)');

        var array:string[] = value.split(",");
        // grab last label which is the most specific label we want to use for the tab
        label = array[array.length - 1];
        // if we are in consumer/producer only mode, then enrich the advanced label to indicate its advanced of those
        if (label === 'advanced' && consumerOnly) {
          label = "consumer (advanced)";
        } else if (label === 'advanced' && producerOnly) {
          label = "producer (advanced)";
        }
      }

      var keys:string[] = tabs[label] || [];
      // an option may be listed in more labels so only define it once so we do not repeat it
      if (keys.indexOf(key) === -1) {
        keys.push(key);
      }
      answer[label] = keys;
    });

    return answer;
  }

  /**
   * Sort the properties tabs in the order we want to display them
   */
  export function sortPropertiesTabs(tabs:{}):{} {
    // now we need to sort the tabs which is tricky as we need to create an array
    // first which we sort, and then re-create the map from the sorted array

    var sorted = [];
    angular.forEach(tabs, function (value, key) {
      sorted.push({'key': key, 'labels': value});
    });

    // sort the tabs in the order we like:
    // common, consumer, producer, a..z
    sorted = sorted.sort((n1:{}, n2:{}) => {
      // common first
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
      // then consumer (advanced)
      if (n1['key'] === 'consumer (advanced)') {
        return -1;
      } else if (n2['key'] === 'consumer (advanced)') {
        return 1;
      }
      // then producer
      if (n1['key'] === 'producer') {
        return -1;
      } else if (n2['key'] === 'producer') {
        return 1;
      }
      // then producer (advanced)
      if (n1['key'] === 'producer (advanced)') {
        return -1;
      } else if (n2['key'] === 'producer (advanced)') {
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

