module Fabric {
  export function ContainersController($scope, $location:ng.ILocationService, workspace:Workspace) {
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
        "mDataProp": "versionLink",
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

    $scope.profileIds = () => {
      // TODO this should be a generic function?
      var answer = [""];
      angular.forEach($scope.profileMap, (value, key) => answer.push(key));
      return answer;
    };

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets update the profileId from the URL if its available
      var key = $location.search()['p'];
      if (key && key !== $scope.profileId) {
        $scope.profileId = key;
        // lets do this asynchronously to avoid Error: $digest already in progress
        setTimeout(updateTableContents, 50);
      }
    });

    function updateTableContents() {
      var data = $scope.containers;
      if ($scope.profileId) {
        data = $scope.profileMap[$scope.profileId];
      }
      $scope.widget.populateTable(data);
    }

    $scope.$watch('profileId', function () {
      if ($scope.profileId) {
        var q = $location.search();
        if ($scope.profileId !== q['p']) {
          q['p'] = $scope.profileId;
          $location.search(q);
        }
      }
      // lets async update the table contents outside of the digest
      setTimeout(updateTableContents, 50);
    });

    $scope.$watch('workspace.selection', function () {
      if (workspace.moveIfViewInvalid()) return;

      function populateTable(response) {
        var values = response.value;
        $scope.containers = defaultContainerValues(workspace, $scope, values);
        updateTableContents();
        $scope.$apply();
      }

      var jolokia = workspace.jolokia;
      jolokia.request(
              {type: 'exec', mbean: managerMBean, operation: 'containers'},
              onSuccess(populateTable));
    });
  }
}