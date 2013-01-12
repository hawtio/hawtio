module Fabric {
  export var managerMBean = "org.fusesource.fabric:type=Fabric";

  /**
   * Default the values that are missing in the returned JSON
   */
  export function defaultContainerValues(workspace:Workspace, values) {
    angular.forEach(values, (row) => {
     row["link"] = containerLinks(workspace, row["id"]);
     row["profileLinks"] = profileLinks(workspace, row["versionId"], row["profileIds"]);

      var id = row['id'] || "";
      var title = "container " + id + " ";
      var img = "red-dot.png";
      if (row['managed'] === false) {
        img = "spacer.gif";
      } else if (!row['alive']) {
        img = "gray-dot.png";
      } else if (row['provisionPending']) {
        img = "pending.gif";
      } else if (row['provisionStatus'] === 'success') {
        img = "green-dot.png";
      }
      img = "img/dots/" + img;
      row["statusImageHref"] =img;
      row["link"] = "<img src='" + img + "' title='" + title + "'/> " + (row["link"] || id);
    });
    return values;
  }


  export function ContainersController($scope, workspace:Workspace) {
    $scope.results = [];

    $scope.widget = new TableWidget($scope, workspace, [
      {
        "mDataProp": null,
        "sClass": "control center",
        "mData": null,
        "sDefaultContent": '<i class="icon-plus"></i>'
      },
      {
        "mDataProp": "link",
        "sDefaultContent": "",
        "mData": null
      },
      {
      "mDataProp": "profileLinks",
      "sDefaultContent": "",
      "mData": null
      },
      {
      "mDataProp": "versionId",
      "sDefaultContent": "",
      "mData": null
      },
      {
      "mDataProp": "localHostName",
      "sDefaultContent": "",
      "mData": null
      },
      {
      "mDataProp": "type",
      "sDefaultContent": "",
      "mData": null
      }
    ], {
      rowDetailTemplateId: 'bodyTemplate',
      disableAddColumns: true
    });

    $scope.$watch('workspace.selection', function () {
      if (workspace.moveIfViewInvalid()) return;

      function populateTable(response) {
        var values = response.value;
        $scope.widget.populateTable(defaultContainerValues(workspace, values));
        $scope.$apply();
      }

      var jolokia = workspace.jolokia;
      jolokia.request(
              {type: 'exec', mbean: managerMBean, operation: 'containers'},
              onSuccess(populateTable));
    });
  }
}