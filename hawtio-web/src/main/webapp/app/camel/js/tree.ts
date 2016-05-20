/// <reference path="camelPlugin.ts"/>
module Camel {

  _module.controller("Camel.TreeHeaderController", ["$scope", "$location", ($scope, $location, localStorage) => {
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

  _module.controller("Camel.TreeController", ["$scope", "$location", "$timeout", "workspace", "$rootScope", "localStorage", ($scope,
                                 $location:ng.ILocationService,
                                 $timeout,
                                 workspace:Workspace,
                                 $rootScope, localStorage) => {
    $scope.contextFilterText = $location.search()["cq"];
    $scope.fullScreenViewLink = Camel.linkToFullScreenView(workspace);

    var camelJmxDomain = localStorage['camelJmxDomain'] || "org.apache.camel";

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateSelectionFromURL, 50);
    });

    var reloadThrottled = Core.throttled(reloadFunction, 500);

    $scope.$watch('workspace.tree', function () {
      reloadThrottled();
    });

    $scope.$watch('contextFilterText', function () {
      if ($scope.contextFilterText != $scope.lastContextFilterText) {
        reloadFunction(() => {
          $("#camelContextIdFilter").focus();
        });
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
      var domainName = camelJmxDomain;

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
              var componentsNode = entries["components"];
              var dataFormatsNode = entries["dataformats"];
              if (contextsFolder) {
                var contextNode = contextsFolder.children[0];
                if (contextNode) {
                  var title = contextNode.title;
                  var folder = new Folder(title);
                  folder.addClass = "org-apache-camel-context";
                  folder.domain = domainName;
                  folder.objectName = contextNode.objectName;
                  folder.entries = contextNode.entries;
                  folder.typeName = contextNode.typeName;
                  folder.key = contextNode.key;
                  folder.version = contextNode.version;
                  if (routesNode) {
                    var routesFolder = new Folder("Routes");
                    routesFolder.addClass = "org-apache-camel-routes-folder";
                    routesFolder.parent = contextsFolder;

                    angular.forEach(routesNode.children, (n) => {
                      // Filter on route names. Child items belonging to the route are lazy loaded
                      // when the context tree is expanded, so these are not filtered
                      if (Core.matchFilterIgnoreCase(n.title, contextFilterText)) {
                        routesFolder.children.push(n);
                        n.addClass = "org-apache-camel-routes";
                        expandFolder(routesFolder, contextFilterText);
                      }
                    });

                    if (!routesFolder.children.isEmpty()) {
                      folder.children.push(routesFolder);
                    }

                    routesFolder.typeName = "routes";
                    routesFolder.key = routesNode.key;
                    routesFolder.domain = routesNode.domain;
                  }
                  if (endpointsNode) {
                    var endpointsFolder = new Folder("Endpoints");
                    endpointsFolder.addClass = "org-apache-camel-endpoints-folder";
                    endpointsFolder.parent = contextsFolder;

                    angular.forEach(endpointsNode.children, (n) => {
                      if (Core.matchFilterIgnoreCase(n.title, contextFilterText)) {
                        n.addClass = "org-apache-camel-endpoints";
                        if (!getContextId(n, camelJmxDomain)) {
                          endpointsFolder.children.push(n);
                          n.entries["context"] = contextNode.entries["context"];
                        }
                        expandFolder(endpointsFolder, contextFilterText);
                      }
                    });

                    if (!endpointsFolder.children.isEmpty()) {
                      folder.children.push(endpointsFolder);
                    }

                    endpointsFolder.entries = contextNode.entries;
                    endpointsFolder.typeName = "endpoints";
                    endpointsFolder.key = endpointsNode.key;
                    endpointsFolder.domain = endpointsNode.domain;
                  }
                  if (componentsNode) {
                    var componentsFolder = new Folder("Components");
                    componentsFolder.addClass = "org-apache-camel-components-folder";
                    componentsFolder.parent = contextsFolder;

                    angular.forEach(componentsNode.children, (n) => {
                      if (Core.matchFilterIgnoreCase(n.title, contextFilterText)) {
                        n.addClass = "org-apache-camel-components";
                        if (!getContextId(n, camelJmxDomain)) {
                          componentsFolder.children.push(n);
                          n.entries["context"] = contextNode.entries["context"];
                        }
                        expandFolder(componentsFolder, contextFilterText);
                      }
                    });

                    if (!componentsFolder.children.isEmpty()) {
                      folder.children.push(componentsFolder);
                    }

                    componentsFolder.entries = contextNode.entries;
                    componentsFolder.typeName = "components";
                    componentsFolder.key = componentsNode.key;
                    componentsFolder.domain = componentsNode.domain;
                  }
                  if (dataFormatsNode) {
                    var dataFormatsFolder = new Folder("Dataformats");
                    dataFormatsFolder.addClass = "org-apache-camel-dataformats-folder";
                    dataFormatsFolder.parent = contextsFolder;

                    angular.forEach(dataFormatsNode.children, (n) => {
                      if (Core.matchFilterIgnoreCase(n.title, contextFilterText)) {
                        n.addClass = "org-apache-camel-dataformats";
                        if (!getContextId(n, camelJmxDomain)) {
                          dataFormatsFolder.children.push(n);
                          n.entries["context"] = contextNode.entries["context"];
                        }
                        expandFolder(dataFormatsFolder, contextFilterText);
                      }
                    });

                    if (!dataFormatsFolder.children.isEmpty()) {
                      folder.children.push(dataFormatsFolder);
                    }

                    dataFormatsFolder.entries = contextNode.entries;
                    dataFormatsFolder.typeName = "dataformats";
                    dataFormatsFolder.key = dataFormatsNode.key;
                    dataFormatsFolder.domain = dataFormatsNode.domain;
                  }

                  // lets add all the entries which are not one context/routes/components/endpoints/dataformats as MBeans
                  var jmxNode = new Folder("MBeans");
                  addMBeanFolder(entries, jmxNode, folder, contextFilterText);

                  // Only add the context node if it, or any children matched filter text
                  if (Core.matchFilterIgnoreCase(contextNode.title, contextFilterText) && !(folder.children.find(c => c.expand == true))) {
                    // The filter text only matched the top-level context node, so add all required items for its child folders
                    addContextFolderChildren(folder, routesFolder, routesNode);
                    addContextFolderChildren(folder, endpointsFolder, endpointsNode);
                    addContextFolderChildren(folder, componentsFolder, componentsNode);
                    addContextFolderChildren(folder, dataFormatsFolder, dataFormatsNode);
                    addMBeanFolder(entries, jmxNode, folder);
                    folder.parent = rootFolder;
                    children.push(folder);
                  } else if (folder.children.length) {
                    // Filter text matched one or more context children
                    // Let's expand the context node if any child folders are expanded
                    if (folder.children.find(c => c.expand == true)) {
                      folder.expand = true;
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

  function addContextFolderChildren(contextFolder, childFolder, childNode) {
    if (childFolder && childFolder.children.isEmpty()) {
      childFolder.children = childNode.children;
      contextFolder.children.push(childFolder);
    }
  }

  function expandFolder(folder, contextFilterText) {
    // Expands a folder if some filter text is present
    if (contextFilterText && contextFilterText.trim().length) {
      folder.expand = true;
    }
  }

  function addMBeanFolder(entries, jmxFolder, contextFolder, contextFilterText = null) {
    if (jmxFolder.children && jmxFolder.children.length == 0) {
      angular.forEach(entries, (jmxChild, name) => {
        if (name !== "context" && name !== "routes" && name !== "endpoints" && name !== "components" && name !== "dataformats") {
          if (Core.matchFilterIgnoreCase(jmxChild.title, contextFilterText)) {
            jmxFolder.children.push(jmxChild);
            expandFolder(jmxFolder, contextFilterText);
          }
        }
      });

      if (jmxFolder.children.length) {
        jmxFolder.sortChildren(false);
        contextFolder.children.push(jmxFolder);
      }
    }
  }
}
