module Camel {

  export function TreeController($scope, $location:ng.ILocationService, workspace:Workspace) {

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateSelectionFromURL, 50);
    });

    $scope.$watch('workspace.tree', function () {
      if (workspace.moveIfViewInvalid()) return;

      // lets update the camel tree...

      console.log("Updating the camel tree");
      var children = [];

      // lets pull out each context

      var tree = workspace.tree;
      if (tree) {
        var domainName = "org.apache.camel";
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
                  var folder = new Folder(contextNode.title);
                  folder.addClass = "camel-context";
                  folder.domain = domainName;
                  folder.objectName = contextNode.objectName;
                  folder.entries = contextNode.entries;
                  if (routesNode) {
                    var routesFolder = new Folder("Routes");
                    routesFolder.addClass = "camel-route-folder";
                    routesFolder.children = routesNode.children;
                    angular.forEach(routesFolder.children, (n) => n.addClass = "camel-route");
                    folder.children.push(routesFolder);
                  }
                  if (endpointsNode) {
                    var endpointsFolder = new Folder("Endpoints");
                    endpointsFolder.addClass = "camel-endpoint-folder";
                    endpointsFolder.children = endpointsNode.children;
                    angular.forEach(endpointsFolder.children, (n) => n.addClass = "camel-endpoint");
                    folder.children.push(endpointsFolder);
                  }
                  var jmxNode = new Folder("Services");

                  // lets add all the entries which are not one context/routes/endpoints

                  angular.forEach(entries, (jmxChild, name) => {
                    if (name !== "context" && name !== "routes" && name !== "endpoints") {
                      jmxNode.children.push(jmxChild);
                    }
                  });

                  if (jmxNode.children.length > 0) {
                    folder.children.push(jmxNode);
                  }
                  children.push(folder);
                }
              }
            }
          });
        }

        var treeElement = $("#cameltree");
        Jmx.enableTree($scope, $location, workspace, treeElement, children);

        updateSelectionFromURL();
      }
    });

    function updateSelectionFromURL() {
      Jmx.updateTreeSelectionFromURL($location, $("#cameltree"));
    }
  }
}