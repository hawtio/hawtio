/**
 * @module Core
 */
/// <reference path="corePlugin.ts"/>
/// <reference path="keycloakLogin.ts"/>
module Core {

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
  _module.controller("Core.LoginController", ["$scope", "jolokia", "userDetails", "jolokiaUrl", "workspace", "localStorage", "branding", "keycloakContext", "postLoginTasks", "postLogoutTasks", ($scope, jolokia, userDetails:Core.UserDetails, jolokiaUrl, workspace, localStorage, branding, keycloakContext, postLoginTasks, postLogoutTasks) => {
    jolokia.stop();

    $scope.keycloakEnabled = keycloakContext.enabled;

    if ($scope.keycloakEnabled) {
      keycloakLoginController($scope, jolokia, userDetails, jolokiaUrl, workspace, localStorage, keycloakContext, postLogoutTasks);
    } else {
      loginController($scope, jolokia, userDetails, jolokiaUrl, workspace, localStorage, branding, postLoginTasks);
    }
  }]);

  var loginController = ($scope, jolokia, userDetails:Core.UserDetails, jolokiaUrl, workspace, localStorage, branding, postLoginTasks) => {
    $scope.userDetails = userDetails;
    $scope.entity = <Core.UserDetails> {
      username: '',
      password: ''
    };
    $scope.backstretch = (<any>$).backstretch(branding.loginBg);
    $scope.rememberMe = false;
    if ('userDetails' in localStorage) {
      $scope.rememberMe = true;
      var details = angular.fromJson(localStorage['userDetails']);
      $scope.entity.username = details.username;
      $scope.entity.password = details.password;
    }
    $scope.branding = branding;

    $scope.$watch('userDetails', (newValue:Core.UserDetails) => {
      if (newValue.username) {
        $scope.entity.username = newValue.username;
      }
      if (newValue.password) {
        $scope.entity.password = newValue.password;
      }
    }, true);

    $scope.$on('$routeChangeStart', function() {
      if ($scope.backstretch) {
        $scope.backstretch.destroy();
      }
    });

    $scope.doLogin = () => {
      if (jolokiaUrl) {
        var url = "auth/login/";

        if ($scope.entity.username.trim() != '') {
          $.ajax(url, {
            type: "POST",
            success: (response) => {
              userDetails.username = $scope.entity.username;
              userDetails.password = $scope.entity.password;
              userDetails.loginDetails = response;

              if ($scope.rememberMe) {
                localStorage['userDetails'] = angular.toJson(userDetails);
              } else {
                delete localStorage['userDetails'];
              }

              jolokia.start();
              workspace.loadTree();
              Core.executePostLoginTasks();
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
          });
        }
      }
    }
  };
}
