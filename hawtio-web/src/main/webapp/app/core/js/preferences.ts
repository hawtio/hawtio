module Core {

  export function PreferencesController($scope, workspace:Workspace) {
    $scope.workspace = workspace;
    $scope.updateRate = workspace.getUpdateRate();

    $scope.$watch('updateRate', () => {
      $scope.workspace.setUpdateRate($scope.updateRate);
    });

    $scope.gotoServer = (url) => {
      console.log("going to server: " + url);
      //window.location = "#/attributes?url=" + url;
      window.open("#/attributes?url=" + encodeURIComponent(url));
    }
  }
}