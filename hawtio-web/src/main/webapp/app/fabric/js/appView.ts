/// <reference path="./fabricPlugin.ts"/>
/// <reference path="../../helpers/js/selectionHelpers.ts"/>
module Fabric {

  // simple service to share our cart with other views
  _module.service("ProfileCart", () => {
    return [];
  });

  export var AppViewPaneHeaderController = _module.controller("Fabric.AppViewPaneHeaderController", ["$scope", ($scope) => {
    $scope.$watch('filter', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        $scope.$emit("Fabric.AppViewPaneController.filter", newValue);
      }
    });
  }]);

  // AppView controller
  export var AppViewController = _module.controller("Fabric.AppViewController", ["$scope", 'jolokia', "$templateCache", "ProfileCart", "$location", "workspace", ($scope, jolokia, $templateCache, ProfileCart:Profile[], $location, workspace:Workspace) => {

    $scope.selectedVersion = {};
    $scope.profiles = <Profile[]>[];
    $scope.cartItems = ProfileCart;
    $scope.tags = [];
    $scope.selectedTags = [];
    $scope.textFilter = '';

    SelectionHelpers.decorate($scope);

    Fabric.loadRestApi(jolokia, $scope);

    $scope.$on('Fabric.AppViewPaneController.filter', ($event, newValue) => {
      $scope.textFilter = newValue;
    });

    $scope.filterProfiles = (profile:Profile) => {
      var answer = $scope.filterByGroup($scope.selectedTags, profile.tags);
      if (!Core.isBlank($scope.textFilter)) {
        var filter = $scope.textFilter.toLowerCase();
        return angular.toJson(profile).toLowerCase().has(filter)
      }
      return answer;
    };

    var profileFields = ['id', 'abstract', 'hidden', 'attributes', 'overlay', 'containerCount', 'associatedContainers', 'fileConfigurations', 'iconURL', 'summaryMarkdown', 'tags'];

    var unreg:() => void = null;

    $scope.$watch('selectedVersion.id', (newValue, oldValue) => {
      if (!Core.isBlank(newValue)) {
        if (unreg) {
          unreg();
        }
        unreg = <() => void>Core.registerForChanges(jolokia, $scope, {
          type: 'exec',
          mbean: Fabric.managerMBean,
          operation: 'getProfiles(java.lang.String,java.util.List)',
          arguments: [newValue, profileFields]
        }, render);
      }
    });

    $scope.deploy = () => {
      $location.url('/fabric/containers/createContainer').search({
        vid: '',
        pid: ''
      });
      Core.$apply($scope);
    };

    $scope.assign = () => {
      $location.url('/fabric/assignProfile');
      Core.$apply($scope);
    };

    $scope.viewProfile = (profile:Profile) => {
      Fabric.gotoProfile(workspace, jolokia, workspace.localStorage, $location, profile.versionId, profile.id);
    };

    function render(response) {
      var value = response.value;
      $scope.profiles = [];
      $scope.tags = [];
      value.forEach((profile:Profile) => {
        if (profile.abstract || profile.hidden || profile.overlay) {
          return;
        }
        var summaryMarkdown = profile["summaryMarkdown"];
        var tags = profile.tags;
        if (!tags || !tags.length) {
          tags = profile.id.split('-');
          var name = tags.last();
          tags = tags.first(tags.length - 1);
        }
        $scope.tags.add(tags);
        $scope.profiles.push(<Profile>{
          id: profile.id,
          versionId: $scope.selectedVersion.id,
          name: name,
          // TODO should we sort tags?
          //tags: tags.sort(),
          tags: tags,
          iconURL: Fabric.toIconURL($scope, profile.iconURL),
          summary: summaryMarkdown ? marked(summaryMarkdown) : "",
          containerCount: profile.containerCount,
          associatedContainers: profile.associatedContainers
        });
      });
      $scope.profiles = $scope.profiles.sortBy('name');
      SelectionHelpers.syncGroupSelection($scope.cartItems, $scope.profiles, 'id');
      $scope.tags = $scope.tags.unique().sort();
      Core.$apply($scope);
    }
  }]);
}
