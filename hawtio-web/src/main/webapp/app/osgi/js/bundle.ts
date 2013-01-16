module Osgi {

  export function BundleController($scope, $filter:ng.IFilterService, workspace:Workspace, $templateCache:ng.ITemplateCacheService, $compile:ng.IAttributes) {
    var dateFilter = $filter('date');

    $scope.widget = new TableWidget($scope, workspace, [
      {
        "mDataProp": null,
        "sClass": "control center",
        "sDefaultContent": '<i class="icon-plus"></i>'
      },
      { "mDataProp": "Identifier" },
      { "mDataProp": "SymbolicName" },
      { "mDataProp": "State",
        "mRender": function (data, type, row) {
          // TODO use CSS icons ideally
          var img = "yellow-dot.png";
          if (data) {
            var lower = data.toString().toLowerCase();
            if (lower) {
              if (lower.startsWith("a")) {
                img = "green-dot.png";
              } else if (lower.startsWith("inst")) {
                img = "gray-dot.png";
              } else if (lower.startsWith("res")) {
                img = "yellow-dot.png";
              } else {
                img = "red-dot.png";
              }
            }
          }
          return "<img src='img/dots/" + img + "' title='" + data + "'/>";
        }
      },
      { "mDataProp": "Version" },
      { "mDataProp": "LastModified",
        "mRender": function (data, type, row) {
          return dateFilter(data, "short");
        }
      }
    ], {
      rowDetailTemplateId: 'osgiBundleTemplate',
      ignoreColumns: ["Headers", "ExportedPackages", "ImportedPackages", "RegisteredServices", "RequiringBundles", "RequiredBundles", "Fragments", "ServicesInUse"]
    });

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      /*
       updateTableContents();
       */

      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateTableContents, 50);
    });

    $scope.$watch('workspace.selection', function () {
      if (workspace.moveIfViewInvalid()) return;
      updateTableContents();
    });

    function populateTable(response) {
      $scope.widget.populateTable(response.value);
      $scope.$apply();
    }

    function updateTableContents() {
      console.log("Loading the bundles");
      var mbean = getSelectionBundleMBean(workspace);
      if (mbean) {
        var jolokia = workspace.jolokia;
        jolokia.request(
                {type: 'exec', mbean: mbean, operation: 'listBundles()'},
                onSuccess(populateTable));
      }
    }
  }
}

// TODO This should be a service
/**
 * Returns the bundle MBean
 */
function getSelectionBundleMBean(workspace:Workspace):string {
  if (workspace) {
    // lets navigate to the tree item based on paths
    var folder = workspace.tree.navigate("osgi.core", "bundleState");
    if (folder) {
      var children = folder.children;
      if (children) {
        var node = children[0];
        if (node) {
          return node.objectName;
        }
      }
    }
  }
  return null;
}
