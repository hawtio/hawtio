/// <reference path="requirements.ts"/>

module FabricRequirements {

  export var ProfileRequirementsController = controller("ProfileRequirementsController", ["$scope", ($scope) => {

    $scope.profileRequirementsString = angular.toJson($scope.requirements.profileRequirements, true);


  }]);

}
