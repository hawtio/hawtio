module Fabric {
  
  export function ProfilesController($scope, $location:ng.ILocationService, workspace:Workspace, jolokia) {
    
    $scope.version = {id: "1.0"};
    
    
    var key = $location.search()['pv'];
    if (key) {
      $scope.version = { id: key };
    }
    
    key = $location.search()['ao'];
    if (angular.isDefined(key) && key === 'true') {
      $scope.activeOnly = true;
    } else {
      $scope.activeOnly = false;
    }
    
    $scope.versions = [];
    $scope.profiles = [];
    
    $scope.versionResponse = [];
    $scope.profilesResponse = [];
    
    $scope.$watch('activeOnly', function(oldValue, newValue) {
      if (oldValue === newValue) {
        return;
      }
      var q = $location.search();
      q['ao'] = "" + $scope.activeOnly;
      $location.search(q);
    });
    
    $scope.$watch('version', function(oldValue, newValue) {
      var q = $location.search();
      q['pv'] = $scope.version.id;
      $location.search(q);
      
      Core.unregister(jolokia, $scope);
      Core.register(jolokia, $scope,[
        {type: 'exec', mbean: managerMBean, operation: 'versions'},
        {type: 'exec', mbean: managerMBean, operation: 'getProfiles(java.lang.String)', arguments: [$scope.version.id]}],
        onSuccess(render));
    });
    
    
    $scope.gridOptions = {
      data: 'profiles',
      showFilter: false,
      showColumnMenu: false,
      filterOptions: {
        useExternalFilter: true
      },
      selectWithCheckboxOnly: true,
      columnDefs: [
        { 
          field: 'id',
          displayName: 'Name',
          cellTemplate: '<div class="ngCellText"><a href="#/fabric/profile/{{$parent.version.id}}/{{row.getProperty(col.field)}}{{hash}}">{{row.getProperty(col.field)}}</a></div>'
        }
      ]
    };
    

    function render(response) {
      
      if (response.request.operation === 'versions') {
        
        if (!Object.equal($scope.versionResponse, response.value)) {
          $scope.versionResponse = response.value
          
          $scope.versions = response.value.map(function(version) { return {id: version.id, default:version.defaultVersion}});
          $scope.version = setSelect($scope.version, $scope.versions);
          
          $scope.$apply();
        }
        
      } else {
        if (!Object.equal($scope.profilesResponse, response.value)) {
          $scope.profilesResponse = response.value;
          $scope.profiles = [];
          
          $scope.profilesResponse.forEach(function(profile) {
            $scope.profiles.push({
              id: profile.id
            })
          })
          console.log("Profiles: ", $scope.profilesResponse);
          $scope.$apply();
        }
      }
    }
      
    

    
    
    
    
  /*    
    
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
      rowDetailTemplateId: 'fabricProfileTemplate',
      disableAddColumns: true
    });

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets update the profileId from the URL if its available
      var ao = $location.search()['ao'];
      if (ao) {
        $scope.activeOnly = true;
      }
      var key = $location.search()['v'];
      if (key && key !== $scope.versionId) {
        $scope.versionId = key;
        // lets do this asynchronously to avoid Error: $digest already in progress
        setTimeout(updateTableContents, 50);
      }
    });

    $scope.$watch('version', function () {
      if (workspace.moveIfViewInvalid()) return;

      var versionId = $scope.versionId;
      if ($scope.version) {
        versionId = $scope.version.id;
      }
      if (!versionId) {
        versionId = "1.0";
      }

      if (versionId !== $scope.versionId) {
        $scope.versionId = versionId;
        var q = $location.search();
        q['v'] = versionId;
        $location.search(q);
        updateTableContents();
      }
    });

    $scope.$watch('activeOnly', function () {
      var q = $location.search();
      if ($scope.activeOnly) {
        q['ao'] = "t";
      } else {
        delete q['ao'];
      }
      $location.search(q);

      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(filterTable, 50);
    });

    function populateTable(response) {
      var values = response.value;
      $scope.allProfiles = defaultProfileValues(workspace, $scope.versionId, values);
      filterTable();
    }

    /**
     * After we have loaded all the profiles lets apply any specific filters
     */
     /*
    function filterTable() {
      $scope.profiles = $scope.allProfiles;
      if ($scope.activeOnly && $scope.profiles) {
        $scope.profiles = $scope.profiles.filter((p) => p["containerCount"] > 0);
      }
      // populate calls $scope.$apply()
      $scope.widget.populateTable($scope.profiles);
    }

    function populateVersions(response) {
      $scope.versions = response.value;
      if (!$scope.versions.isEmpty()) {
        if ($scope.versionId) {
          // lets re-select the version object based on the last selection
          $scope.version = $scope.versions.find({ id: $scope.versionId });
        }
        else {
          // lets default the version
          $scope.version = $scope.versions.find({ defaultVersion: true}) || $scope.versions[0];
        }
      }
    }

    function updateTableContents() {
      var jolokia = workspace.jolokia;
      //console.log("Requesting profiles for version " + $scope.versionId);
      jolokia.request(
              [
                {type: 'exec', mbean: managerMBean, operation: 'versions'},
                {type: 'exec', mbean: managerMBean,
                  operation: 'getProfiles(java.lang.String)',
                  arguments: [$scope.versionId]}
              ],
              onSuccess([populateVersions, populateTable]));
    }
  */
    
  }
}