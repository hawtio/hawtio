function BundleController($scope, workspace:Workspace) {
  $scope.widget = new TableWidget($scope, workspace, [
    {
      "mDataProp": null,
      "sClass": "control center",
      "sDefaultContent": '<i class="icon-plus"></i>'
    },
    { "mDataProp": "Identifier" }
  ], {
    ignoreColumns: ["Headers", "RegisteredServices", "ExportedPackages", "RequiringBundles", "RequiredBundles", "Fragments", "ServicesInUse", "ImportedPackages"]
  });

  $scope.$watch('workspace.selection', function () {
    if (workspace.moveIfViewInvalid()) return;

    var mbean = getSelectionBundleMBean(workspace);
    if (mbean) {
      var jolokia = workspace.jolokia;
      jolokia.request(
              {type: 'exec', mbean: mbean, operation: 'listBundles()'},
              onSuccess(populateTable));
    }
  });

  var populateTable = function (response) {
    $scope.widget.populateTable(response.value);
    $scope.$apply();
  };
}


/**
 * Returns the bundle MBean
 */
function getSelectionBundleMBean(workspace:Workspace) {
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
