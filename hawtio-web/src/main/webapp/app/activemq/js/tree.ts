/// <reference path="activemqPlugin.ts"/>
/// <reference path="../../tree/js/treePlugin.ts"/>
module ActiveMQ {

  _module.controller("ActiveMQ.TreeHeaderController", ["$scope", ($scope) => {
    $scope.expandAll = () => {
      Tree.expandAll("#activemqtree");
    };

    $scope.contractAll = () => {
      Tree.contractAll("#activemqtree");
    };
  }]);

  _module.controller("ActiveMQ.TreeController", ["$scope", "$location", "workspace", "localStorage", (
      $scope,
      $location: ng.ILocationService,
      workspace: Workspace,
      localStorage: WindowLocalStorage) => {

    var amqJmxDomain = localStorage['activemqJmxDomain'] || "org.apache.activemq";

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateSelectionFromURL, 50);
    });


    $scope.$watch('workspace.tree', function () {
      reloadTree();
    });

    $scope.$on('jmxTreeUpdated', function () {
      reloadTree();
    });

    function reloadTree() {
      log.debug("workspace tree has changed, lets reload the activemq tree");

      var children = [];
      var tree = workspace.tree;
      if (tree) {
        var domainName = amqJmxDomain;
        var folder = tree.get(domainName);
        if (folder) {
          children = folder.children;
        }
        if (children.length) {
          var firstChild = children[0];
          // the children could be AMQ 5.7 style broker name folder with the actual MBean in the children
          // along with folders for the Queues etc...
          if (!firstChild.typeName && firstChild.children.length < 4) {
            // lets avoid the top level folder
            var answer = [];
            angular.forEach(children, (child) => {
              answer = answer.concat(child.children);
            });
            children = answer;
          }
        }

        // filter out advisory topics
        children.forEach(broker => {
          var grandChildren = broker.children;
          if (grandChildren) {
            var idx = grandChildren.findIndex(n => n.title === "Topic");
            if (idx > 0) {
              var old = grandChildren[idx];

              // we need to store all topics the first time on the workspace
              // so we have access to them later if the user changes the filter in the preferences
              var key = "ActiveMQ-allTopics-" + broker.title;
              var allTopics = old.children.clone();
              workspace.mapData[key] = allTopics;

              var filter = Core.parseBooleanValue(localStorage["activemqFilterAdvisoryTopics"]);
              if (filter) {
                if (old && old.children) {
                  var filteredTopics = old.children.filter(c => !c.title.startsWith("ActiveMQ.Advisory"));
                  old.children = filteredTopics;
                }
              } else if (allTopics) {
                old.children = allTopics;
              }
            }
          }
        });

        var treeElement = $("#activemqtree");
        Jmx.enableTree($scope, $location, workspace, treeElement, children, true);
        // lets do this asynchronously to avoid Error: $digest already in progress
        setTimeout(updateSelectionFromURL, 50);
      }
    }

    function updateSelectionFromURL() {
      Jmx.updateTreeSelectionFromURLAndAutoSelect($location, $("#activemqtree"), (first) => {
        if(first.getChildren() != null) {
          // use function to auto select the queue folder on the 1st broker
          var queues = first.getChildren()[0];
          if (queues && queues.data.title === 'Queue') {
            first = queues;
            first.expand(true);
            return first;
          }
        } else {
          return null;
        }
      }, true);
    }
  }]);
}
