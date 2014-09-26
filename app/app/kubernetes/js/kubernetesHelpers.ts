/// <reference path="../../baseIncludes.ts"/>
module Kubernetes {

  export interface KubePod {
    id:string;
  }

  export function setJson($scope, id, collection) {
    $scope.id = id;
    if (!$scope.fetched) {
      return;
    }
    if (!id) {
      $scope.json = '';
      return;
    }
    var item = collection.find((item) => { return item.id === id; });
    if (!item) {
      $scope.id = undefined;
      $scope.json = '';
    } else {
      $scope.json = angular.toJson(item, true);
    }
  }


}
