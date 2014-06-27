/// <reference path="./fabricPlugin.ts"/>
/// <reference path="../../helpers/js/selectionHelpers.ts"/>
module Fabric {

  // nicer to have type info...
  interface Profile {
    id?: string;
    name?: string;
    tags?: string[];
    versionId?: string;
    summary?: string;

    abstract?: boolean;
    hidden?: boolean;
    overlay?: boolean;
    containerCount?: number;
    // is really a map
    attributes?: any;
    // think this is an array
    associatedContainers?: any;
    // an array
    fileConfigurations?: any;
  }


  // ProfileBox controller
  _module.controller("Fabric.ProfileBox", ['$scope', 'jolokia', 'workspace', '$location', ($scope, jolokia, workspace:Workspace, $location) => {
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

    $scope.viewProfile = (profile:Profile, $event) => {
      Fabric.gotoProfile(workspace, jolokia, workspace.localStorage, $location, profile.versionId, profile.id);
      $event.stopPropagation();
    };

  }]);


  // AppView controller
  _module.controller("Fabric.AppView", ["$scope", 'jolokia', "$templateCache", ($scope, jolokia, $templateCache) => {

    $scope.selectedVersion = {};
    $scope.profiles = <Profile[]>[];
    $scope.cartItems = <Profile[]>[];
    $scope.tags = [];
    $scope.selectedTags = [];

    SelectionHelpers.decorate($scope);

    $scope.filterProfiles = (profile:Profile) => {
      var answer = $scope.filterByGroup($scope.selectedTags, profile.tags);
      //log.debug("Returning ", answer, " for profile: ", profile.id);
      return answer;
    };

    $scope.cart = {
      data: 'cartItems',
      selectedItems: [],
      showSelectionCheckbox: true,
      columnDefs: [
        {
          field: 'id',
          displayName: 'Name',
          cellTemplate: $templateCache.get('cartItem.html')
        }
      ]
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

    $scope.filter = (profile) => {

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
      $scope.tags = $scope.tags.unique().sort();
      Core.$apply($scope);
    }

  }]);

}
