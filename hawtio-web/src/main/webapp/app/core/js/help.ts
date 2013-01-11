module Core {
  export function HelpController($scope, $routeParams, $location) {
    // Each time controller is recreated, check tab in url
    $scope.currentTab = $routeParams.tabName;

    // When we click on a tab, the directive changes currentTab
    $scope.$watch('currentTab', function (name, oldName) {
      if (name !== oldName) {
        $location.path('help/' + name);
      }
    });
  }
}