module Fabric {


  export function ContainersController($scope, workspace, jolokia) {
    
    $scope.search = "";
    
    $scope.profile = "";
    $scope.version = "";
    
    // caches last jolokia result
    $scope.result = [];
    
    // rows in container table
    $scope.containers = [];
    
    $scope.profiles = [];
    $scope.versions = [];
    
    // selected containers
    $scope.selectedContainers = [];

    $scope.afterContainerSelectionChange = (rowItem, event) => {
      console.log($scope);
      $scope.selectedProfiles = [];
      var tmp = [];
      angular.forEach($scope.selectedContainers, function(value, key) {
        value.profileIds.forEach(function(profile) {
          $scope.profiles.forEach(function(p) {
            if (p.id === profile) {
              p.__ng_selected__ = true;
            }
          })
        });
      });
    }
    
    $scope.containerOptions = {
      data: 'containers',
      showFilter: false,
      filterOptions: {
        filterText: 'search'
      },
      afterSelectionChange: $scope.afterContainerSelectionChange,
      selectedItems: $scope.selectedContainers,
      rowHeight: 41,
      selectWithCheckboxOnly: true,
      columnDefs: [
        { 
          field: 'status',
          displayName: 'Status',
          cellTemplate: '<div class="ngCellText pagination-centered"><i class="icon1point5x {{row.getProperty(col.field)}}"></i></div>',
          width: 56,
          minWidth: 56,
          maxWidth: 56,
          resizable: false
        },
        {
          field: 'name',
          displayName: 'Name',
          cellTemplate: '<div class="ngCellText"><a href="#/fabric/container/{{row.getProperty(col.field)}}">{{row.getProperty(col.field)}}</a></div>'
        },
        {
          field: 'version',
          displayName: 'Version',
          cellTemplate: '<div class="ngCellText"><a href="#/fabric/profiles?v={{row.getProperty(col.field)}}">{{row.getProperty(col.field)}}</a></div>'
        },
        {
          field: 'services',
          displayName: 'Services',
          cellTemplate: '<div class="ngCellText"><ul class="unstyled inline"><li ng-repeat="service in row.getProperty(col.field)" ng-switch="service.type"><i ng-switch-when="icon" class="{{service.src}}" title="{{service.title}}"></i><img ng-switch-when="img" ng-src="{{service.src}}" title="{{service.title}}"></li></ul>'
        },
        {
          field: 'actions',
          displayName: 'Actions',
          cellTemplate: '<div class="ngCellText"><div class="btn-group" ng-switch="row.entity.alive"><button class="btn" title="Start Container" ng-switch-when="false" ng-click="startContainer(row.entity.name)"><i class="icon-play"></i></button><button class="btn" title="Stop Container" ng-switch-default ng-click="stopContainer(row.entity.name)"><i class="icon-stop"></i></button><button class="btn" title="Destroy Container" ng-click="deleteContainer(row.entity.name)"><i class="icon-remove"></i></button></div></div>',
          width: 85,
          sortable: false,
          groupable: false,
          resizable: false
        }
      ]
    };
  
    Core.register(jolokia, $scope, {
      type: 'exec', mbean: managerMBean,
      operation: 'containers()',
      arguments: []
    }, onSuccess(render));
    
    function render(response) {
      if (!Object.equal($scope.result, response.value)) {

        $scope.result = response.value;
        
        $scope.containers = [];
        $scope.profiles = [{
          id: ""
        }];
        
        $scope.versions = [{
          id: ""
        }];
        
        var tmp_profiles = [];
        var tmp_versions = [];
        
        $scope.result.forEach(function (container) {
          
          var services = getServiceList(container);
          
          tmp_profiles = tmp_profiles.union(container.profileIds);
          tmp_versions = tmp_versions.union([container.versionId]);
          
          $scope.containers.push({
            name: container.id,
            alive: container.alive,
            version: container.versionId,
            status: $scope.statusIcon(container),
            services: services,
            profileIds: container.profileIds
          });
        });
        
        tmp_profiles.forEach(function(profile) {
          $scope.profiles.push({
            id: profile
          });
        });
        
        tmp_versions.forEach(function(version) {
          $scope.versions.push({
            id: version
          })
        });
        
        $scope.$apply();
      }
    }
    
    $scope.stopContainer = (name) => {
      // TODO proper notifications
      stopContainer(jolokia, name, function() {console.log("Stopped!")}, function() {console.log("Failed to stop!")});      
    }
    
    $scope.stop = () => {
      $scope.selected.forEach(function (container) {
        $scope.stopContainer(container.name);
      });
    }
    
    $scope.deleteContainer = (name) => {
      // TODO proper notifications
      destroyContainer(jolokia, name, function() {console.log("Deleted!")}, function() {console.log("Failed to delete!")});
    }

    $scope.delete = () => {
      $scope.selected.forEach(function (container) {
        $scope.deleteContainer(container.name);
      });
    }
    
    $scope.startContainer = (name) => {
      // TODO proper notifications
      startContainer(jolokia, name, function() {console.log("Started!")}, function() {console.log("Failed to start!")});
    }

    $scope.start = () => {
      $scope.selected.forEach(function (container) {
        $scope.startContainer(container.name);
      });
    }
    
    $scope.statusIcon = (row) => {
      if (row) {
        if (row.alive) {
          switch(row.provisionResult) {
            case 'success': 
              return "icon-thumbs-up";
            case 'downloading':
              return "icon-download-alt";
            case 'installing':
              return "icon-hdd";
            case 'analyzing':
            case 'finalizing':
              return "icon-refresh icon-spin";
            case 'resolving':
              return "icon-sitemap";
            case 'error':
              return "red icon-warning-sign";
          }
        } else {
          return "icon-off";
        }
      }
      return "icon-refresh icon-spin";
    }
  }
}
