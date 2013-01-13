module Fabric {
  export function ProfilesController($scope, $location:ng.ILocationService, workspace:Workspace) {
    $scope.results = [];
    $scope.versions = [];

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
        "mDataProp": "containersCountLink",
        "mRender": function (data, type, row) {
          if (data) {
            return data;
          } else return "";
        }
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


    function populateTable(response) {
      var values = response.value;
      $scope.widget.populateTable(defaultProfileValues(workspace, $scope.versionId, values));
      $scope.$apply();
    }

    function populateVersions(response) {
      $scope.versions = response.value;
      if (!$scope.versions.isEmpty()) {
        if ($scope.version) {
          // lets re-select the version object based on the last selection
          $scope.version = $scope.versions.find({ id: $scope.versionId });
        }
        else {
          // lets default the version
          $scope.version = $scope.versions.find({ defaultVersion: true}) || $scope.versions[0];
        }
      }
      $scope.$apply();
    }

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets update the profileId from the URL if its available
      var key = $location.search()['vid'];
      if (key && key !== $scope.versionId) {
        $scope.versionId = key;
        // lets do this asynchronously to avoid Error: $digest already in progress
        setTimeout(updateTableContents, 50);
      }
    });

    function updateTableContents() {
      var jolokia = workspace.jolokia;
      jolokia.request(
              [
                {type: 'exec', mbean: managerMBean, operation: 'versions'},
                {type: 'exec', mbean: managerMBean,
                  operation: 'getProfiles(java.lang.String)',
                  arguments: [$scope.versionId]}
              ],
              onSuccess([populateVersions, populateTable]));
    }

    $scope.$watch('version', function () {
      if (workspace.moveIfViewInvalid()) return;

      var versionId = null;
      if ($scope.version) {
        versionId = $scope.version.id;
      }
      if (!versionId) {
        versionId = "1.0";
      }

      if (versionId !== $scope.versionId) {
        $scope.versionId = versionId;


        updateTableContents();
      }
    });
  }
}