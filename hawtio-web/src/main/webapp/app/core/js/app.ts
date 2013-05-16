module Core {

  export function AppController($scope, $location, workspace, $document, pageTitle, localStorage) {

    $scope.collapse = '';
    $scope.match = null;
    $scope.pageTitle = pageTitle.exclude('hawtio');

    $scope.setPageTitle = () => {
      var tab = workspace.getActiveTab();
      if (tab && tab.content) {
        var foo:any = Array;
        setPageTitle($document, foo.create(pageTitle, tab.content));
      } else {
        setPageTitle($document, pageTitle);
      }
    }

    $scope.setRegexIndicator = () => {
      try {
        var regexs = angular.fromJson(localStorage['regexs']);
        if (regexs) {
          regexs.reverse().each((regex) => {
            var r = new RegExp(regex.regex, 'g');
            if (r.test($location.absUrl())) {
              $scope.match = {
                name: regex.name,
                color: regex.color
              }
            }
          });
        }
      } catch (e) {
        // ignore
      }
    }

    $scope.$watch(() => { return localStorage['regexs'] }, $scope.setRegexIndicator);

    $scope.$on('$routeChangeSuccess', function() {
      $scope.setPageTitle();
      $scope.setRegexIndicator();
    });

    $scope.fullScreen = () => {
      var tab = $location.search()['tab'];
      if (tab) {
        return tab === "fullscreen";
      }
      return false;
    }

  }

}
