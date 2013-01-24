module Fabric {


  export function ContainersController($scope, $location, workspace, jolokia) {
    
    $scope.profile = empty();
    $scope.version = empty();
    
    var key = $location.search()['cv'];
    if (key) {
      $scope.version = { id: key };
    }
    
    key = $location.search()['cp'];
    if (key) {
      $scope.profile = { id: key };
    }
    
    
    // caches last jolokia result
    $scope.result = [];
    
    // rows in container table
    $scope.containers = [];
    
    $scope.profiles = [];
    $scope.versions = [];
    
    // selected containers
    $scope.selectedContainers = [];


    var SearchProvider = function(scope, location) {
      var self = this;
      self.scope = scope;
      self.location = location;

      self.callback = function(newValue, oldValue) {
        if (newValue === oldValue) {
          return;
        }
        if (newValue.id === oldValue.id) {
          return;
        }
        self.scope.profiles = activeProfilesForVersion(self.scope.version.id, self.scope.containers);
        self.scope.profile = setSelect(self.scope.profile, self.scope.profiles);
        
        var q = location.search();
        q['cv'] = self.scope.version.id;
        q['cp'] = self.scope.profile.id;
        location.search(q);
        
        self.evalFilter();
      };
      
      self.scope.$watch('version', self.callback);
      self.scope.$watch('profile', self.callback);

      self.init = function(childScope, grid) {
        self.grid = grid;
        self.childScope = childScope;
        grid.searchProvider = self;
      };
      
      self.evalFilter = function() {

        var byVersion = self.grid.sortedData;
        if (self.scope.version.id !== "" ) {
          byVersion = self.grid.sortedData.findAll(function(item) { return item.version === self.scope.version.id });
        }

        var byProfile = byVersion;
        
        if (self.scope.profile.id !== "" ) {
          byProfile = byVersion.findAll(function(item) { return item.profileIds.findIndex(function(id) { return id === self.scope.profile.id }) !== -1 });
        }
        
        self.grid.filteredData = byProfile;
        self.grid.rowFactory.filteredDataChanged();
      };
      
    }
    
    var searchProvider = new SearchProvider($scope, $location);
    
    $scope.containerOptions = {
      plugins: [searchProvider],
      data: 'containers',
      showFilter: false,
      showColumnMenu: false,
      filterOptions: {
        useExternalFilter: true
      },
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
    
    function empty() {
      return [{id: ""}];
    }
    
    function activeProfilesForVersion(version, containers) {
      if (version === "") {
        return activeProfiles(containers);
      }
      var answer = empty();
      containers.findAll(function(container) { return container.version === version }).forEach(function(container) {
        answer = answer.union(container.profileIds.map(function(id) { return {id: id}; }));
      });
      return answer;
    }
    
    function activeProfiles(containers) {
      var answer = empty();
      containers.forEach(function (container) { answer = answer.union(container.profileIds.map( function(id) { return { id: id }}))});
      return answer;
    }
    
    function setSelect(selection, group) {
      if (!angular.isDefined(selection)) {
        return group[0];
      }
      var answer = group.findIndex( function(item) { return item.id === selection.id } );
      if (answer !== -1) {
        return group[answer];
      } else {
        return group[0];
      }
    }
    
    function render(response) {
      if (!Object.equal($scope.result, response.value)) {

        $scope.result = response.value;
        
        $scope.containers = [];
        $scope.profiles = empty();
        $scope.versions = empty();
        
        $scope.result.forEach(function (container) {
          
          var services = getServiceList(container);
          
          $scope.profiles = $scope.profiles.union(container.profileIds.map(function(id) { return {id: id}; }));
          $scope.versions = $scope.versions.union([{ id: container.versionId }]);
          
          $scope.containers.push({
            name: container.id,
            alive: container.alive,
            version: container.versionId,
            status: $scope.statusIcon(container),
            services: services,
            profileIds: container.profileIds
          });
        });

        $scope.version = setSelect($scope.version, $scope.versions);        
        $scope.profiles = activeProfilesForVersion($scope.version.id, $scope.containers);
        $scope.profile = setSelect($scope.profile, $scope.profiles);

        $scope.$apply();
      }
    }
    
    $scope.stopContainer = (name) => {
      // TODO proper notifications
      stopContainer(jolokia, name, function() {console.log("Stopped!")}, function() {console.log("Failed to stop!")});      
    }
    
    $scope.stop = () => {
      $scope.selectedContainers.forEach(function (container) {
        $scope.stopContainer(container.name);
      });
    }
    
    $scope.deleteContainer = (name) => {
      // TODO proper notifications
      destroyContainer(jolokia, name, function() {console.log("Deleted!")}, function() {console.log("Failed to delete!")});
    }

    $scope.delete = () => {
      $scope.selectedContainers.forEach(function (container) {
        $scope.deleteContainer(container.name);
      });
    }
    
    $scope.startContainer = (name) => {
      // TODO proper notifications
      startContainer(jolokia, name, function() {console.log("Started!")}, function() {console.log("Failed to start!")});
    }

    $scope.start = () => {
      $scope.selectedContainers.forEach(function (container) {
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
