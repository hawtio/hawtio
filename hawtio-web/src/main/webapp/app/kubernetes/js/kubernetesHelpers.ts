/// <reference path="../../fabric/js/fabricGlobals.ts"/>
/// <reference path="../../baseIncludes.ts"/>
/// <reference path="../../baseHelpers.ts"/>
module Kubernetes {

  export var context = '/kubernetes';
  export var hash = '#' + context;
  export var defaultRoute = hash + '/overview';
  export var pluginName = 'Kubernetes';
  export var templatePath = 'app/kubernetes/html/';
  export var log:Logging.Logger = Logger.get(pluginName);

  export var defaultApiVersion = "v1beta2";

  export var appSuffix = ".app";

  export interface KubePod {
    id:string;
  }

  export var mbean = Fabric.jmxDomain + ":type=Kubernetes";
  export var managerMBean = Fabric.jmxDomain + ":type=KubernetesManager";

  export function isKubernetes(workspace) {
    return workspace.treeContainsDomainAndProperties(Fabric.jmxDomain, {type: "Kubernetes"});
  }

  export function setJson($scope, id, collection) {
    $scope.id = id;
    if (!$scope.fetched) {
      return;
    }
    if (!id) {
      $scope.json = '';
      return;
    }
    if (!collection) {
      return;
    }
    var item = collection.find((item) => { return item.id === id; });
    if (item) {
      $scope.json = angular.toJson(item, true);
      $scope.item = item;
    } else {
      $scope.id = undefined;
      $scope.json = '';
      $scope.item = undefined;
    }
  }


  /**
   * Returns the labels text string using the <code>key1=value1,key2=value2,....</code> format
   */
  export function labelsToString(labels, seperatorText = ",") {
    var answer = "";
    angular.forEach(labels, (value, key) => {
      var separator = answer ? seperatorText : "";
      answer += separator + key + "=" + value;
    });
    return answer;
  }

  export function initShared($scope, $location) {
    var currentFilter = $location.search()["q"];
    if (currentFilter) {
      $scope.tableConfig.filterOptions.filterText = currentFilter;
    }

    // update the URL if the filter is changed
    $scope.$watch("tableConfig.filterOptions.filterText", () => {
      var filter = $scope.tableConfig.filterOptions.filterText;
      if (!filter) {
        filter = null;
      }
      $location.search("q", filter);
    });

    $scope.$on("labelFilterUpdate", ($event, text) => {
      var filterText = $scope.tableConfig.filterOptions.filterText;
      if (Core.isBlank(filterText)) {
        $scope.tableConfig.filterOptions.filterText = text;
      } else {
        var expressions = filterText.split(/\s+/);
        if (expressions.any(text)) {
          // lets exclude this filter expression
          expressions = expressions.remove(text);
          $scope.tableConfig.filterOptions.filterText = expressions.join(" ");
        } else {
          $scope.tableConfig.filterOptions.filterText = filterText + " " + text;
        }
      }
      $scope.id = undefined;
    });
  }
}
