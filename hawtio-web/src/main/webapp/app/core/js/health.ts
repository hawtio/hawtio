function HealthController($scope, workspace:Workspace) {
  $scope.widget = new TableWidget($scope, workspace, [
    {
      "mDataProp": null,
      "sClass": "control center",
      "sDefaultContent": '<i class="icon-plus"></i>'
    }
  ]);

  $scope.$watch('workspace.selection', function () {
    if (workspace.moveIfViewInvalid()) return;

    var mbean = getStatusMBean(workspace);
    if (mbean) {
      var jolokia = workspace.jolokia;
      jolokia.request(
              {type: 'exec', mbean: mbean, operation: 'healthList()'},
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
function getStatusMBean(workspace:Workspace) {
  var broker = null;
  if (workspace) {
    var selection = workspace.selection;
    if (selection) {
      var domain = selection.domain;
      if (domain) {
        var mbean = workspace.domainToHealth[domain];
        if (mbean) {
          return mbean;
        }
      }
      var folderNames = selection.folderNames;
      if (folderNames && folderNames.length > 1) {
        broker = folderNames[1];
      } else {
        var entries = selection.entries;
        if (!entries) {
          selection = selection.parent;
          if (selection) entries = selection.entries;
        }
        if (entries) {
          broker = entries["BrokerName"];
        }
      }
    }
  }
  console.log("Found broker " + broker);
  if (broker) {
    return "org.apache.activemq:BrokerName=" + broker + ",Type=Health";
  } else {
    return null;
  }
}
