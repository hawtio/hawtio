/// <reference path="./fabricPlugin.ts"/>
/// <reference path="../../helpers/js/selectionHelpers.ts"/>
module Fabric {

  // simple service to share our cart with other views
  _module.service("ProfileCart", () => {
    return [];
  });

  // ProfileBox controller
  export var ProfileBoxController = _module.controller("Fabric.ProfileBoxController", ['$scope', 'jolokia', 'workspace', '$location', ($scope, jolokia, workspace:Workspace, $location) => {
    var profile = <Profile>$scope.profile;
    var responseJson = '';

    Core.registerForChanges(jolokia, $scope, {
      type: 'exec',
      mbean: Fabric.managerMBean,
      operation: 'getConfigurationFile(java.lang.String,java.lang.String,java.lang.String)',
      arguments: [profile.versionId, profile.id, 'Summary.md']
    }, (response) => {
      var base64Encoded = <string>response.value;
      if (Core.isBlank(base64Encoded)) {
        profile.summary = '';
        return;
      }
      profile.summary = base64Encoded.decodeBase64();
      Core.$apply($scope);
    });

    $scope.viewProfile = (profile:Profile) => {
      Fabric.gotoProfile(workspace, jolokia, workspace.localStorage, $location, profile.versionId, profile.id);
    };

  }]);


  // AppView controller
  export var AppViewController = _module.controller("Fabric.AppViewController", ["$scope", 'jolokia', "$templateCache", "ProfileCart", "$location", ($scope, jolokia, $templateCache, ProfileCart:Profile[], $location) => {

    $scope.selectedVersion = {};
    $scope.profiles = <Profile[]>[];
    $scope.cartItems = ProfileCart;
    $scope.tags = [];
    $scope.selectedTags = [];

    SelectionHelpers.decorate($scope);

    $scope.filterProfiles = (profile:Profile) => {
      var answer = $scope.filterByGroup($scope.selectedTags, profile.tags);
      //log.debug("Returning ", answer, " for profile: ", profile.id);
      return answer;
    };

    var profileFields = ['id', 'abstract', 'hidden', 'attributes', 'overlay', 'containerCount', 'associatedContainers', 'fileConfigurations'];

    var unreg:() => void = null;

    $scope.$watch('selectedVersion.id', (newValue, oldValue) => {
      log.debug("selectedVersion.id: ", newValue);
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

    function render(response) {
      var value = response.value;
      $scope.profiles = [];
      $scope.tags = [];
      value.forEach((profile:Profile) => {
        if (profile.abstract || profile.hidden || profile.overlay) {
          return;
        }
        if (!profile.fileConfigurations.any('Summary.md')) {
          return;
        }
        var tags = profile.id.split('-');
        var name = tags.last();
        tags = tags.first(tags.length - 1);
        $scope.tags.add(tags);
        $scope.profiles.push(<Profile>{
          id: profile.id,
          versionId: $scope.selectedVersion.id,
          name: name,
          tags: tags.sort(),
          containerCount: profile.containerCount,
          associatedContainers: profile.associatedContainers
        });
      });
      $scope.profiles = $scope.profiles.sortBy('name');
      SelectionHelpers.syncGroupSelection($scope.cartItems, $scope.profiles, 'id');
      $scope.tags = $scope.tags.unique().sort();
      SelectionHelpers.syncGroupSelection($scope.selectedTags, $scope.tags);
      Core.$apply($scope);
    }

  }]);

}
