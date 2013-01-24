module Core {
  export interface INavBarController extends ng.IScope{
    workspace : Workspace;
    hash : string;
    validSelection : (uri:string) => bool;
    isActive : (string) => bool;

    topLevelTabs: () => MenuItem[];
    subLevelTabs: () => MenuItem[];

    isValid: (MenuItem) => bool;
    link: (MenuItem) => string;
    fullScreen: () => bool;
  }

  export function NavBarController($scope:INavBarController, $location:ng.ILocationService, workspace:Workspace) {
    // TODO why do we keep binding the workspace to the scope?
    $scope.workspace = workspace;

    $scope.topLevelTabs = () => $scope.workspace.topLevelTabs;

    $scope.subLevelTabs = () => $scope.workspace.subLevelTabs;

    $scope.validSelection = (uri) => workspace.validSelection(uri);

    $scope.isValid = (nav) => nav.isValid();

    // when we change the view/selection lets update the hash so links have the latest stuff
    $scope.$on('$routeChangeSuccess', function () {
      $scope.hash = workspace.hash();
    });

    $scope.link = (nav) => {
      return createHref($location, nav.href(), ['tab']);
    };

    $scope.isActive = (nav) => {
      if (angular.isString(nav))
        return workspace.isLinkActive(nav);
      var fn = nav.isActive;
      if (fn) {
        return fn();
      }
      return workspace.isLinkActive(nav.href());
    };

    $scope.fullScreen = () => {
      var tab = $location.search()['tab'];
      if (tab) {
        return tab === "fullscreen";
      }
      return false;
    }
  }
}