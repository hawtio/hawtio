module Jmx {

  export function AttributeController($scope, jolokia) {

    $scope.init = (mbean, attribute) => {
      $scope.mbean = mbean;
      $scope.attribute = attribute;

      if (angular.isDefined($scope.mbean) && angular.isDefined($scope.attribute)) {
        Core.register(jolokia, $scope, {
          type: 'read', mbean: $scope.mbean, attribute: $scope.attribute
        }, onSuccess(render));
      }
    }

    function render(response) {
      if (!Object.equal($scope.data, response.value)) {
        $scope.data = response.value;
        $scope.$apply();
      }
    }

  }

}
