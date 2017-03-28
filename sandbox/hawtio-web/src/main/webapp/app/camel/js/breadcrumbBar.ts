/// <reference path="camelPlugin.ts"/>
module Camel {

  _module.controller("Camel.BreadcrumbBarController", ["$scope", "$routeParams", "workspace", "jolokia", "localStorage", ($scope, $routeParams, workspace:Workspace, jolokia, localStorage) => {
    $scope.workspace = workspace;

    var camelJmxDomain = localStorage['camelJmxDomain'] || "org.apache.camel";

    // if we are in dashboard then $routeParams may be null
    if ($routeParams != null) {
      $scope.contextId = $routeParams["contextId"];
      $scope.endpointPath = $routeParams["endpointPath"];
      $scope.endpointName = tidyJmxName($scope.endpointPath);
      $scope.routeId = $routeParams["routeId"];
    }

    $scope.treeViewLink = linkToTreeView(camelJmxDomain);

    var defaultChildEntity = $scope.endpointPath ? "endpoints" : "routes";
    var childEntityToolTips = {
      "endpoints": "Camel Endpoint",
      "routes": "Camel Route"
    };

    /**
     * The array of breadcrumbs so that each item in the list of bookmarks can be switched for fast navigation and
     * we can easily render the navigation path
     */
    $scope.breadcrumbs = [
      {
        name: $scope.contextId,
        items: findContexts(camelJmxDomain),
        tooltip: "Camel Context"
      },
      {
        name: defaultChildEntity,
        items: findChildEntityTypes($scope.contextId, camelJmxDomain),
        tooltip: "Entity inside a Camel Context"
      },
      {
        name: $scope.endpointName || tidyJmxName($scope.routeId),
        items: findChildEntityLinks($scope.contextId, currentChildEntity(), camelJmxDomain),
        tooltip: childEntityToolTips[defaultChildEntity]
      }
    ];

    // lets find all the camel contexts
    function findContexts(camelJmxDomain) {
      var answer = [];
      var rootFolder = Camel.getRootCamelFolder(workspace, camelJmxDomain);
      if (rootFolder) {
        angular.forEach(rootFolder.children, (contextFolder) => {
          var id = contextFolder.title;
          if (id && id !== $scope.contextId) {
            var name = id;
            var link = createLinkToFirstChildEntity(id, currentChildEntity(), camelJmxDomain);
            answer.push({
              name: name,
              tooltip: "Camel Context",
              link: link
            });
          }
        });
      }
      return answer;
    }

    // lets find all the the child entities of a camel context
    function findChildEntityTypes(contextId, camelJmxDomain) {
      var answer = [];
      angular.forEach(["endpoints", "routes"], (childEntityName) => {
        if (childEntityName && childEntityName !== currentChildEntity()) {
          var link = createLinkToFirstChildEntity(contextId, childEntityName, camelJmxDomain);
          answer.push({
            name: childEntityName,
            tooltip: "Entity inside a Camel Context",
            link: link
          });
        }
      });
      return answer;
    }

    function currentChildEntity() {
      var answer = Core.pathGet($scope, ["breadcrumbs", "childEntity"]);
      return answer || defaultChildEntity;
    }

    /**
     * Based on the current child entity type, find the child links for the given context id and
     * generate a link to the first child; used when changing context or child entity type
     */
    function createLinkToFirstChildEntity(id, childEntityValue, camelJmxDomain) {
      var links = findChildEntityLinks(id, childEntityValue, camelJmxDomain);
      // TODO here we should switch to a default context view if there's no endpoints available...
      var link = links.length > 0 ? links[0].link : linkToBrowseEndpointFullScreen(id, "noEndpoints");
      return link;
    }

    function findChildEntityLinks(contextId, childEntityValue, camelJmxDomain) {
      if ("endpoints" === childEntityValue) {
        return findEndpoints(contextId, camelJmxDomain);
      } else {
        return findRoutes(contextId, camelJmxDomain);
      }
    }

    // lets find all the endpoints for the given context id
    function findEndpoints(contextId, camelJmxDomain) {
      var answer = [];
      var contextFolder = Camel.getCamelContextFolder(workspace, contextId, camelJmxDomain);
      if (contextFolder) {
        var endpoints = (contextFolder["children"] || []).find((n) => "endpoints" === n.title);
        if (endpoints) {
          angular.forEach(endpoints.children, (endpointFolder) => {
            var entries = endpointFolder ? endpointFolder.entries : null;
            if (entries) {
              var endpointPath = entries["name"];
              if (endpointPath) {
                var name = tidyJmxName(endpointPath);
                var link = linkToBrowseEndpointFullScreen(contextId, endpointPath);

                answer.push({
                  contextId: contextId,
                  path: endpointPath,
                  name: name,
                  tooltip: "Endpoint",
                  link: link
                });
              }
            }
          });
        }
      }
      return answer;
    }

    // lets find all the routes for the given context id
    function findRoutes(contextId, camelJmxDomain) {
      var answer = [];
      var contextFolder = Camel.getCamelContextFolder(workspace, contextId, camelJmxDomain);
      if (contextFolder) {
        var folders = (contextFolder["children"] || []).find((n) => "routes" === n.title);
        if (folders) {
          angular.forEach(folders.children, (folder) => {
            var entries = folder ? folder.entries : null;
            if (entries) {
              var routeId = entries["name"];
              if (routeId) {
                var name = tidyJmxName(routeId);
                var link = linkToRouteDiagramFullScreen(contextId, routeId);
                answer.push({
                  contextId: contextId,
                  path: routeId,
                  name: name,
                  tooltip: "Camel Route",
                  link: link
                });
              }
            }
          });
        }
      }
      return answer;
    }


    /**
     * Creates a link to the tree view version of this view
     */
    function linkToTreeView(camelJmxDomain) {
      var answer:string = null;
      if ($scope.contextId) {
        var node = null;
        var tab:string = null;
        if ($scope.endpointPath) {
          tab = "browseEndpoint";
          node = workspace.findMBeanWithProperties(camelJmxDomain, {
            context: $scope.contextId,
            type: "endpoints",
            name: $scope.endpointPath
          });
        } else if ($scope.routeId) {
          tab = "routes";
          node = workspace.findMBeanWithProperties(camelJmxDomain, {
            context: $scope.contextId,
            type: "routes",
            name: $scope.routeId
          });
        }
        var key = node ? node["key"] : null;
        if (key && tab) {
          answer = "#/camel/" + tab + "?tab=camel&nid=" + key;
        }
      }
      return answer;
    }

    function tidyJmxName(jmxName) {
      return jmxName ? Core.trimQuotes(jmxName) : jmxName;
    }
  }]);
}
