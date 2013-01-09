module Fabric {
  export function ProfilesController($scope, workspace:Workspace) {
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
      "sDefaultContent": "",
      "mData": null
      },
      {
      "mDataProp": "parentIds",
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
      // TODO pick the version ID from the list of available ones
      // defaulting to the current one!
      var versionId = "1.0";
      jolokia.request(
              {type: 'exec', mbean: managerMBean, operation: 'getProfiles(java.lang.String)', arguments: [versionId]},
              onSuccess(populateTable));
    });
  }
}