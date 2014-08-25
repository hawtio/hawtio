/// <reference path="requirements.ts"/>
/// <reference path="../../health/js/healthHelpers.ts"/>
module FabricRequirements {

  interface IProfileRequirementsController extends Health.HealthMixins {
    hideTitle: boolean;
    healthTemplate:string;
    profileRequirementsString:string;
    fabricHealth: any;
    requirements:FabricRequirements.CurrentRequirements;
    remove: (profileRequirement:Fabric.ProfileRequirement) => void;
  }

  export var ProfileRequirementsController = controller("ProfileRequirementsController", ["$scope", "jolokia", "$templateCache", ($scope:IProfileRequirementsController, jolokia, $templateCache:ng.ITemplateCacheService) => {

    Health.decorate($scope);
    $scope.hideTitle=true;
    $scope.healthTemplate = '';

    Core.registerForChanges(jolokia, $scope, {
      type: 'exec',
      mbean: Fabric.healthMBean,
      operation: 'healthList',
      arguments: []
    }, (response) => {
      $scope.fabricHealth = ObjectHelpers.toMap(response.value, 'profile', $scope.generateChartData);
      if (Core.isBlank($scope.healthTemplate)) {
        $scope.healthTemplate = $templateCache.get('healthTemplate.html');
      } else {
        $scope.healthTemplate = $scope.healthTemplate + ' ';
      }
      log.debug("Got health mbean list: ", $scope.fabricHealth);
      Core.$apply($scope);
    });

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
