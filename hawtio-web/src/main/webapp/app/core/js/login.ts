/**
 * @module Core
 */
module Core {

  export function LoginController($scope, jolokia, userDetails, jolokiaUrl, workspace, localStorage, branding) {
    jolokia.stop();

    $scope.backstretch = (<any>$).backstretch(branding.loginBg);

    $scope.username = '';
    $scope.password = '';
    $scope.rememberMe = false;
    $scope.branding = branding;

    var details = angular.fromJson(localStorage[jolokiaUrl]);
    if (details) {
      $scope.username = details['username'];
      $scope.password = details['password'];
      $scope.rememberMe = details['rememberMe'];
    }

    $scope.$on('$routeChangeStart', function() {
      if ($scope.backstretch) {
        $scope.backstretch.destroy();
      }
    });

    $scope.doLogin = () => {

      var url = jolokiaUrl.replace("jolokia", "auth/login/");

      $.ajax(url, {
        type: "POST",
        success: (response) => {
          userDetails.username = $scope.username;
          userDetails.password = $scope.password;
          userDetails.rememberMe = $scope.rememberMe;
          userDetails.loginDetails = response;

          if ($scope.rememberMe) {
            localStorage[jolokiaUrl] = angular.toJson(userDetails);
          } else {
            delete localStorage[jolokiaUrl];
          }

          jolokia.start();
          workspace.loadTree();

          Core.$apply($scope);
        },
        error: (xhr, textStatus, error) => {
          // TODO placeholder for more feedback
          switch(xhr.status) {
            case 401:
              notification('error', 'Failed to log in, ' + error);
              break;
            case 403:
              notification('error', 'Failed to log in, ' + error);
              break;
            default:
              notification('error', 'Failed to log in, ' + error);
              break;
          }
          Core.$apply($scope);
        },
        beforeSend: (xhr) => {
          xhr.setRequestHeader('Authorization', Core.getBasicAuthHeader($scope.username, $scope.password));
        }

        //username: $scope.username,
        //password: $scope.password
      });

    }


  }
}
