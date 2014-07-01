/// <reference path="./fabricPlugin.ts"/>
/// <reference path="../../helpers/js/selectionHelpers.ts"/>
module Fabric {

  // simple service to share our cart with other views
  _module.service("ProfileCart", () => {
    return [];
  });

  // AppView controller
  export var AppViewController = _module.controller("Fabric.AppViewController", ["$scope", 'jolokia', "$templateCache", "ProfileCart", "$location", "workspace", ($scope, jolokia, $templateCache, ProfileCart:Profile[], $location, workspace:Workspace) => {

    $scope.selectedVersion = {};
    $scope.profiles = <Profile[]>[];
    $scope.cartItems = ProfileCart;
    $scope.tags = [];
    $scope.selectedTags = [];

    SelectionHelpers.decorate($scope);

    $scope.filterProfiles = (profile:Profile) => {
      //log.debug("selected tags: ", $scope.selectedTags);
      var answer = $scope.filterByGroup($scope.selectedTags, profile.tags);
      if (!Core.isBlank($scope.textFilter)) {
        var filter = $scope.textFilter.toLowerCase();
        return answer.all((profile:Profile) => {
          var json = angular.toJson(profile).toLowerCase();
          return json.has(filter);
        });
      }
      //log.debug("Returning ", answer, " for profile: ", profile.id);
      return answer;
    };

    var profileFields = ['id', 'abstract', 'hidden', 'attributes', 'overlay', 'containerCount', 'associatedContainers', 'fileConfigurations'];

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
      //SelectionHelpers.syncGroupSelection($scope.selectedTags, $scope.tags);
      Core.$apply($scope);
      jolokia.request({
        type: 'exec',
        mbean: Fabric.managerMBean,
        operation: "getConfigurationFiles(java.lang.String,java.util.List,java.lang.String)",
        arguments: [$scope.selectedVersion.id, $scope.profiles.map((p) => { return p.id; }), '.*']
      }, onSuccess((response) => {
        angular.forEach(response.value, (configs, id) => {
          usingProfile($scope.profiles, id, (profile) => {
            var encodedSummary = configs['Summary.md'];
            if (encodedSummary) {
              profile.summary = encodedSummary.decodeBase64();
            } else {
              profile.summary = '';
            }
          });
        });
        Core.$apply($scope);
      }));
    }

  }]);

}
