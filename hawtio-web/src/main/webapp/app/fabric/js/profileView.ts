/// <reference path="./fabricPlugin.ts"/>
/// <reference path="../../helpers/js/selectionHelpers.ts"/>
/// <reference path="../../helpers/js/filterHelpers.ts"/>
/// <reference path="./profileHelpers.ts"/>
module Fabric {

  // simple service to share our cart with other views
  _module.service("ProfileCart", () => {
    return [];
  });

  export var AppViewPaneHeaderController = _module.controller("Fabric.AppViewPaneHeaderController", ["$scope", "ProfileCart", "$location", ($scope, ProfileCart, $location) => {

    SelectionHelpers.decorate($scope);

    $scope.cartItems = ProfileCart;

    $scope.getName = () => {
      return $scope.cartItems.map((p) => { return p.id; }).join(", ");
    }

    $scope.deploy = () => {
      $location.path('/fabric/containers/createContainer').search({
        p: 'fabric',
        vid: '',
        pid: '',
        hideProfileSelector: true,
        returnTo: '/profiles'
      });
      Core.$apply($scope);
    };

    $scope.assign = () => {
      $location.path('/fabric/assignProfile');
      Core.$apply($scope);
    };


    $scope.$watch('filter', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        $scope.$emit("Fabric.AppViewPaneController.filter", newValue);
      }
    });
  }]);


  // AppView controller
  export var AppViewController = _module.controller("Fabric.AppViewController", ["$scope", 'jolokia', "$templateCache", "ProfileCart", "$location", "workspace", "marked", ($scope, jolokia, $templateCache, ProfileCart:Profile[], $location, workspace:Workspace, marked) => {

    $scope.selectedVersion = {};
    $scope.profiles = <Profile[]>[];
    $scope.cartItems = ProfileCart;
    $scope.tags = [];
    $scope.selectedTags = [];
    $scope.textFilter = '';
    $scope.lowercaseTextFilter = '';

    SelectionHelpers.decorate($scope);

    Fabric.loadRestApi(jolokia, $scope);

    $scope.$on('Fabric.AppViewPaneController.filter', ($event, newValue) => {
      $scope.textFilter = newValue;
    });

    $scope.filterProfiles = (profile:Profile) => {
      var answer = <boolean>$scope.filterByGroup($scope.selectedTags, profile.tags);
      if (answer && !Core.isBlank($scope.textFilter)) {
        var filter = $scope.textFilter.toLowerCase();
        return FilterHelpers.searchObject(profile, filter);
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
        var tags = ProfileHelpers.getTags(profile);
        $scope.tags.add(tags);
        $scope.profiles.push(<Profile>{
          id: profile.id,
          versionId: $scope.selectedVersion.id,
          name: profile.id,
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
