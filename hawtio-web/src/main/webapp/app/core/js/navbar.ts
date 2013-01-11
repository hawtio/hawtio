module Core {
  export interface INavBarController extends ng.IScope{
    workspace : Workspace;
    hash : string;
    validSelection : (uri:string) => bool;
    isCurrentRoute : (string) => bool;
    openTab : (any) => any;
  }

  export function NavBarController($scope:INavBarController, $location:ng.ILocationService, workspace:Workspace) {
    // TODO why do we keep binding the workspace to the scope?
    $scope.workspace = workspace;

    $scope.validSelection = (uri) => workspace.validSelection(uri);

    // when we change the view/selection lets update the hash so links have the latest stuff
    $scope.$on('$routeChangeSuccess', function () {
      $scope.hash = workspace.hash();
    });

    $scope.openTab = (tab) => {
      console.log("About to open tab: " + tab.content);
      tab.ngClick();
      console.log("done clicking tab: " + tab.content);
    };

    $scope.isCurrentRoute = (page) => {
      // TODO Why is 'home' used? It doesn't appear anywhere
      var currentRoute = $location.path().substring(1) || 'home';
      var isCurrentRoute = currentRoute.startsWith(page);
      return isCurrentRoute;
    };
  }
}