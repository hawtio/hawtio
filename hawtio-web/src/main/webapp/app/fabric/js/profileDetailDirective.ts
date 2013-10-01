module Fabric {

  export class ProfileDetails {
    public restrict = 'A';
    public replace = true;
    public templateUrl = Fabric.templatePath + "profileDetailsDirective.html";

    public scope = {
      versionId: '=',
      profileId: '='
    };

    public controller = ($scope, $element, $attrs, $routeParams, jolokia, $location, workspace, $q) => {

      $scope.inDirective = true;

      Fabric.ProfileController($scope, $routeParams, jolokia, $location, workspace, $q);
    };

  }


}
