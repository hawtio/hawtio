module Jmx {

  export function CheeseController($scope, $location, $routeParams, jolokia) {

    // allow these to be injected in when using ng-include
/*
    $$location = $scope.$location || $$location;
    $routeParams = $scope.routeParams || $routeParams;
*/

    //console.log("has $scope " + $scope);
    console.log("has $location " + JSON.stringify($location));
    console.log("has $routeParams " + JSON.stringify($routeParams));

  }

}
