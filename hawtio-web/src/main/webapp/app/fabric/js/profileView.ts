/// <reference path="./fabricPlugin.ts"/>
/// <reference path="../../helpers/js/selectionHelpers.ts"/>
/// <reference path="../../helpers/js/filterHelpers.ts"/>
/// <reference path="./profileHelpers.ts"/>
module Fabric {

  // simple service to share our cart with other views
  _module.service("ProfileCart", () => {
    return [];
  });

  export interface ProfileViewAction {
    index: Number;
    icon: String;
    objectName?: string;
    methodName?: string;
    argumentTypes?: string;
    name?: String;
    buttonClass?: String;
    title: String;
    action: () => void;
  }

  export interface ProfileViewActions {
    [name:string]:ProfileViewAction;
  }

  // service that can be used by other modules to add additional actions
  // that can be performed on the selected profiles
  _module.service("ProfileViewActions", ['$location', '$rootScope', ($location, $rootScope) => {
    return <ProfileViewActions>{
      'Deploy': {
        index: 0,
        icon: 'icon-ok',
        buttonClass: 'btn-success',
        objectName: Fabric.managerMBean,
        methodName: 'createContainers',
        title: 'Deploy the selected profiles to new containers',
        action: () => {
          var me = $location.path();
          $location.path('/fabric/containers/createContainer').search({
            p: 'fabric',
            vid: '',
            pid: '',
            hideProfileSelector: true,
            returnTo: me,
            nextPage: '/fabric/containerView?groupBy=profileIds'
          });
          Core.$apply($rootScope);
        }
      },
      'Assign': {
        index: 2,
        icon: 'icon-truck',
        buttonClass: 'btn-primary',
        objectName: Fabric.managerMBean,
        methodName: 'addProfilesToContainer',
        title: 'Deploy the selected profiles to existing containers',
        action: () => {
          $location.path('/fabric/assignProfile');
          Core.$apply($rootScope);
        }

      }
    }
  }]);

  export var AppViewPaneHeaderController = _module.controller("Fabric.AppViewPaneHeaderController", ["$scope", "ProfileCart", "ProfileViewActions", ($scope, ProfileCart, ProfileViewActions) => {

    SelectionHelpers.decorate($scope);
    var lastIndex:Number = null;
    var buttons:Array<ProfileViewAction> = [];
    angular.forEach(ProfileViewActions, (value, key) => {
      value['name'] = key;
      buttons.add(value);
    });
    $scope.actionButtons = buttons;

    $scope.cartItems = ProfileCart;

    $scope.getName = () => {
      return $scope.cartItems.map((p) => { return p.id; }).join(", ");
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

    Fabric.loadRestApi(jolokia, workspace, undefined, (response) => {
      $scope.restApiUrl = UrlHelpers.maybeProxy(Core.injector.get('jolokiaUrl'), response.value);
      log.debug("Scope rest API: ", $scope.restApiUrl);
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
