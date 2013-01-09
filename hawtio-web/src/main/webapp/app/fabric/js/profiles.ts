module Fabric {
  export function profileLinks(workspace, values) {
    var answer = "";
    angular.forEach(values, function(value, key) {
      var prefix = "";
      if (answer.length > 0) {
        prefix = " ";
      }
      answer += prefix + "<a href='#/fabric/profile/" + value + workspace.hash() + "'>" + value + "</a>";
    });
    return answer;
  }

  export function ProfilesController($scope, workspace:Workspace) {
    $scope.results = [];

    // TODO load this from the version model!!!
    $scope.versionId = "1.0";

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
      "mDataProp": "parentLinks",
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
       angular.forEach(values, (row) => {
        row["parentLinks"] = profileLinks(workspace, row["parentIds"]);
       });
      return values;
    }

    $scope.$watch('versionId', function () {
      if (workspace.moveIfViewInvalid()) return;

      function populateTable(response) {
        var values = response.value;
        $scope.widget.populateTable(defaultValues(values));
        $scope.$apply();
      }

      var jolokia = workspace.jolokia;
      jolokia.request(
              {type: 'exec', mbean: managerMBean,
                operation: 'getProfiles(java.lang.String)',
                arguments: [$scope.versionId]},
              onSuccess(populateTable));
    });
  }
}