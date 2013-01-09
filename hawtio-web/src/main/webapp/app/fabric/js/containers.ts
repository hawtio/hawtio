module Fabric {
  export var managerMBean = "org.fusesource.fabric:type=Fabric";

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
        "mDataProp": "id",
        "mRender": function (data, type, row) {
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
        return "<img src='img/dots/" + img + "' title='" + title + "'/> " + id;
      }
      },
      {
      "mDataProp": "profileIds",
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

    /**
     * Default the values that are missing in the returned JSON
     */
    function defaultValues(values) {
      /*
       angular.forEach(values, (aData) => {
       var domain = aData["domain"];
       if (!domain) {
       var id = aData["healthId"];
       if (id) {
       var idx = id.lastIndexOf('.');
       if (idx > 0) {
       domain = id.substring(0, idx);
       var alias = _healthDomains[domain];
       if (alias) {
       domain = alias;
       }
       var kind = aData["kind"];
       if (!kind) {
       kind = humanizeValue(id.substring(idx + 1));
       aData["kind"] = kind;
       }
       }
       }
       aData["domain"] = domain;
       }
       });
       */
      return values;
    }

    $scope.$watch('workspace.selection', function () {
      if (workspace.moveIfViewInvalid()) return;

      function populateTable(response) {
        var values = response.value;
        $scope.widget.populateTable(defaultValues(values));
        $scope.$apply();
      }

      var jolokia = workspace.jolokia;
      jolokia.request(
              {type: 'exec', mbean: managerMBean, operation: 'containers'},
              onSuccess(populateTable));
    });
  }
}