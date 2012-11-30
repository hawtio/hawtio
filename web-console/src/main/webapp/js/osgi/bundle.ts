function BundleController($scope, $filter, workspace:Workspace, $templateCache, $compile) {
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
    ignoreColumns: ["Headers", "ExportedPackages", "ImportedPackages", "RegisteredServices", "RequiringBundles", "RequiredBundles", "Fragments", "ServicesInUse"]
  });


  var html = $templateCache.get('bodyTemplate');

  // customise the expansion
  $scope.widget.populateDetailDiv = (row, elm) => {
    $scope.row = row;
    if (html) {
      elm.html(html);
      var results = $compile(elm.contents())($scope);
      console.log("Got results " + results);
    }
  };

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
