module Core {
  export interface INavBarController extends ng.IScope{
    workspace : Workspace;
    hash : string;
    validSelection : (uri:string) => bool;
    isActive : (string) => bool;

    topLevelTabs: () => MenuItem[];
    subLevelTabs: () => MenuItem[];

    isValid: (MenuItem) => bool;
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

    $scope.isActive = (href) => {
      return workspace.isLinkActive(href);
    };
  }
}