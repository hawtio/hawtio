/// <reference path="camelPlugin.ts"/>
module Camel {

  _module.controller("Camel.TreeHeaderController", ["$scope", "$location", ($scope, $location) => {

    $scope.contextFilterText = '';

    $scope.$watch('contextFilterText', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        $scope.$emit("camel-contextFilterText", newValue);
      }
    });

    $scope.expandAll = () => {
      Tree.expandAll("#cameltree");
    };

    $scope.contractAll = () => {
      Tree.contractAll("#cameltree");
    };
  }]);

  _module.controller("Camel.TreeController", ["$scope", "$location", "$timeout", "workspace", "$rootScope", ($scope,
                                 $location:ng.ILocationService,
                                 $timeout,
                                 workspace:Workspace,
                                 $rootScope) => {
    $scope.contextFilterText = $location.search()["cq"];
    $scope.fullScreenViewLink = Camel.linkToFullScreenView(workspace);

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateSelectionFromURL, 50);
    });

    var reloadThrottled = Core.throttled(reloadFunction, 500);

    $scope.$watch('workspace.tree', function () {
      reloadThrottled();
    });

    var reloadOnContextFilterThrottled = Core.throttled(() => {
      reloadFunction(() => {
        $("#camelContextIdFilter").focus();
      });
    }, 500);

    $scope.$watch('contextFilterText', function () {
      if ($scope.contextFilterText != $scope.lastContextFilterText) {
        $timeout(reloadOnContextFilterThrottled, 250);
      }
    });

    $rootScope.$on('camel-contextFilterText', (event, value) => {
      $scope.contextFilterText = value;
    });

    $scope.$on('jmxTreeUpdated', function () {
      reloadThrottled();
    });

    function reloadFunction(afterSelectionFn = null) {
      $scope.fullScreenViewLink = Camel.linkToFullScreenView(workspace);

      var children = [];
      var domainName = Camel.jmxDomain;

      // lets pull out each context
      var tree = workspace.tree;
      if (tree) {
        var rootFolder = new Folder("Camel Contexts");
        rootFolder.addClass = "org-apache-camel-context-folder";
        rootFolder.children = children;
        rootFolder.typeName = "context";
        rootFolder.key = "camelContexts";
        rootFolder.domain = domainName;

        var contextFilterText = $scope.contextFilterText;
        $scope.lastContextFilterText = contextFilterText;
        log.debug("Reloading the tree for filter: " + contextFilterText);
        var folder = tree.get(domainName);
        if (folder) {
          angular.forEach(folder.children, (value, key) => {
            var entries = value.map;
            if (entries) {
              var contextsFolder = entries["context"];
              var routesNode = entries["routes"];
              var endpointsNode = entries["endpoints"];
              if (contextsFolder) {
                var contextNode = contextsFolder.children[0];
                if (contextNode) {
                  var title = contextNode.title;
                  var match = Core.matchFilterIgnoreCase(title, contextFilterText);
                  if (match) {
                    var folder = new Folder(title);
                    folder.addClass = "org-apache-camel-context";
                    folder.domain = domainName;
                    folder.objectName = contextNode.objectName;
                    folder.entries = contextNode.entries;
                    folder.typeName = contextNode.typeName;
                    folder.key = contextNode.key;
                    if (routesNode) {
                      var routesFolder = new Folder("Routes");
                      routesFolder.addClass = "org-apache-camel-routes-folder";
                      routesFolder.parent = contextsFolder;
                      routesFolder.children = routesNode.children;
                      angular.forEach(routesFolder.children, (n) => n.addClass = "org-apache-camel-routes");
                      folder.children.push(routesFolder);
                      routesFolder.typeName = "routes";
                      routesFolder.key = routesNode.key;
                      routesFolder.domain = routesNode.domain;
                    }
                    if (endpointsNode) {
                      var endpointsFolder = new Folder("Endpoints");
                      endpointsFolder.addClass = "org-apache-camel-endpoints-folder";
                      endpointsFolder.parent = contextsFolder;
                      endpointsFolder.children = endpointsNode.children;
                      angular.forEach(endpointsFolder.children, (n) => {
                        n.addClass = "org-apache-camel-endpoints";
                        if (!getContextId(n)) {
                          n.entries["context"] = contextNode.entries["context"];
                        }
                      });
                      folder.children.push(endpointsFolder);
                      endpointsFolder.entries = contextNode.entries;
                      endpointsFolder.typeName = "endpoints";
                      endpointsFolder.key = endpointsNode.key;
                      endpointsFolder.domain = endpointsNode.domain;
                    }
                    var jmxNode = new Folder("MBeans");

                    // lets add all the entries which are not one context/routes/endpoints
                    angular.forEach(entries, (jmxChild, name) => {
                      if (name !== "context" && name !== "routes" && name !== "endpoints") {
                        jmxNode.children.push(jmxChild);
                      }
                    });

                    if (jmxNode.children.length > 0) {
                      jmxNode.sortChildren(false);
                      folder.children.push(jmxNode);
                    }
                    folder.parent = rootFolder;
                    children.push(folder);
                  }
                }
              }
            }
          });
        }

        var treeElement = $("#cameltree");
        Jmx.enableTree($scope, $location, workspace, treeElement, [rootFolder], true);
        // lets do this asynchronously to avoid Error: $digest already in progress
        setTimeout(() => {
          updateSelectionFromURL()
          if (angular.isFunction(afterSelectionFn)) {
            afterSelectionFn();
          }
        }, 50);
      }
    }

    function updateSelectionFromURL() {
      Jmx.updateTreeSelectionFromURLAndAutoSelect($location, $("#cameltree"), (first) => {
        // use function to auto select first Camel context routes if there is only one Camel context
        var contexts = first.getChildren();
        if (contexts && contexts.length === 1) {
          first = contexts[0];
          first.expand(true);
          var children = first.getChildren();
          if (children && children.length) {
            var routes = children[0];
            if (routes.data.typeName === 'routes') {
              first = routes;
              return first;
            }
          }
        }
        return null;
      }, true);
      $scope.fullScreenViewLink = Camel.linkToFullScreenView(workspace);
    }
  }]);

}
