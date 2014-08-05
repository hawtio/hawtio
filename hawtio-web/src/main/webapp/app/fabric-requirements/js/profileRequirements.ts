/// <reference path="requirements.ts"/>

module FabricRequirements {

  export var ProfileRequirementsController = controller("ProfileRequirementsController", ["$scope", ($scope) => {
    log.debug("Requirements: ", $scope.requirements);

  }]);

}
