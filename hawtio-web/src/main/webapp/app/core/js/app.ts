module Core {

  export function AppController($scope, $location, workspace, $document, pageTitle, localStorage, userDetails, lastLocation, jolokiaUrl) {

    if (userDetails.username === null) {
      // sigh, hack
      $location.url('/help');
    }

    $scope.collapse = '';
    $scope.match = null;
    $scope.pageTitle = pageTitle.exclude('hawtio');
    $scope.userDetails = userDetails;
    $scope.confirmLogout = false;

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

    $scope.loggedIn = () => {
      return userDetails.username !== null && userDetails.username !== 'public';
    }

    $scope.logout = () => {
      $scope.confirmLogout = true;
    }

    $scope.doLogout = () => {

      $scope.confirmLogout = false;

      var url = jolokiaUrl.replace("jolokia", "auth/logout/");

      $.ajax(url, {
        type: "POST",
        success: () => {
          userDetails.username = null;
          userDetails.password = null;
          $scope.$apply();
        },
        error: (xhr, textStatus, error) => {
          // TODO, more feedback
          switch(xhr.status) {
            case 401:
              notification('error', 'Failed to log out, ' + error);
              break;
            case 403:
              notification('error', 'Failed to log out, ' + error);
              break;
            default:
              notification('error', 'Failed to log out, ' + error);
              break;
          }
          $scope.$apply();
        }
      });
    }

    $scope.$watch(() => { return localStorage['regexs'] }, $scope.setRegexIndicator);

    $scope.$watch('userDetails', (newValue, oldValue) => {
      if (userDetails.username === null) {
        lastLocation.url = $location.url('/login');
      }
      console.log("userDetails: ", userDetails);
    }, true);

    $scope.$on('$routeChangeStart', function() {
      if (userDetails.username === null) {
        lastLocation.url = $location.url('/login');
      }
    });

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
