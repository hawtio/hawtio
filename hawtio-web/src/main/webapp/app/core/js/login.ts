/**
 * @module Core
 */
module Core {

  export var username: string = null;
  export var password: string = null;

  /**
   * Controller that handles the login page and actually logging in
   *
   * @method LoginController
   * @for Core
   * @static
   * @param $scope
   * @param jolokia
   * @param userDetails
   * @param jolokiaUrl
   * @param workspace
   * @param localStorage
   * @param branding
   */
  export function LoginController($scope, jolokia, userDetails, jolokiaUrl, workspace, localStorage, branding) {
    jolokia.stop();

    $scope.entity = {
      username: '',
      password: ''
    };
    $scope.backstretch = (<any>$).backstretch(branding.loginBg);

    $scope.rememberMe = false;
    $scope.branding = branding;

    var details = angular.fromJson(localStorage[jolokiaUrl]);
    if (details) {
      $scope.entity.username = details['username'];
      $scope.entity.password = details['password'];
      $scope.rememberMe = details['rememberMe'];
    }

    $scope.$on('$routeChangeStart', function() {
      if ($scope.backstretch) {
        $scope.backstretch.destroy();
      }
    });

    jQuery(window).bind(
      "beforeunload",
      function() {
        // auto logout if we should not remember me
        if (!userDetails.rememberMe) {
          console.log("Auto logging out as remember me is off");
          logout(jolokiaUrl, userDetails, localStorage, $scope);
        }
      }
    );

    $scope.doLogin = () => {
      if (jolokiaUrl) {
        var url = jolokiaUrl.replace("jolokia", "auth/login/");

        $.ajax(url, {
          type: "POST",
          success: (response) => {
            userDetails.username = $scope.entity.username;
            userDetails.password = $scope.entity.password;
            userDetails.rememberMe = $scope.rememberMe;
            userDetails.loginDetails = response;

            Core.username = $scope.entity.username;
            Core.password = $scope.entity.password;
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
            switch (xhr.status) {
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
            xhr.setRequestHeader('Authorization', Core.getBasicAuthHeader($scope.entity.username, $scope.entity.password));
          }

          //username: $scope.entity.username,
          //password: $scope.entity.password
        });
      }
    }
  }
}
