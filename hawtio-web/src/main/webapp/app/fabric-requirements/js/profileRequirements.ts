/// <reference path="requirements.ts"/>

module FabricRequirements {

  export var ProfileRequirementsController = controller("ProfileRequirementsController", ["$scope", ($scope) => {

    $scope.profileRequirementsString = angular.toJson(($scope.requirements || {}).profileRequirements || [], true);

    $scope.remove = (profileRequirement:Fabric.ProfileRequirement) => {
      var oldLength = $scope.requirements.profileRequirements.length;
      $scope.requirements.profileRequirements.remove((r) => {
        return r.profile === profileRequirement.profile;
      });
      var newLength = $scope.requirements.profileRequirements.length;
      if (oldLength > newLength) {
        $scope.requirements.$dirty = true;
      }
    };

  }]);

}
