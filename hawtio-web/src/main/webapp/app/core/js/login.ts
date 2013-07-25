module Core {

  export function LoginController($scope, jolokia, userDetails, jolokiaUrl, workspace, $location, lastLocation) {
    jolokia.stop();

    $scope.username = '';
    $scope.password = '';

    $scope.rememberMe = false;

    $scope.doLogin = () => {

      var url = jolokiaUrl.replace("jolokia", "auth/login/");

      $.ajax(url, {
        type: "POST",
        success: () => {
          userDetails.username = $scope.username;
          userDetails.password = $scope.password;

          if ($scope.rememberMe) {
            localStorage[jolokiaUrl] = angular.toJson(userDetails);
          }

          //$.ajaxSetup(userDetails);

          jolokia.start();
          workspace.loadTree();

          $location.url(lastLocation.url);

          $scope.$apply();
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
          $scope.$apply();
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
