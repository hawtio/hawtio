/**
 * @module Jmx
 */
/// <reference path="./jmxPlugin.ts"/>
module Jmx {

  _module.controller("Jmx.AttributeController", ["$scope", "jolokia", ($scope, jolokia) => {

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
        $scope.data = safeNull(response.value);
        Core.$apply($scope);
      }
    }
  }]);

  _module.controller("Jmx.AttributeChartController", ["$scope", "jolokia", "$document", ($scope, jolokia, $document) => {

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

      if (!angular.isDefined($scope.chart)) {
        $scope.chart = $($document.find("#" + $scope.attribute)[0]);
        if ($scope.chart) {
          $scope.width = $scope.chart.width();
        }
      }

      if (!angular.isDefined($scope.context)) {
        console.log("Got: ", response);

        $scope.context = cubism.context()
            .serverDelay(0)
            .clientDelay(0)
            .step(1000)
            .size($scope.width);
        $scope.jcontext = $scope.context.jolokia(jolokia);

        $scope.metrics = [];

        Object.extended(response.value).keys(function(key, value) {

          $scope.metrics.push($scope.jcontext.metric({
            type: 'read',
            mbean: $scope.mbean,
            attribute: $scope.attribute,
            path: key
          }, $scope.attribute));

        });

        d3.select("#" + $scope.attribute).call(function(div) {
          div.append("div")
              .data($scope.metrics)
              .call($scope.context.horizon());
        });

        // let cubism take over at this point...
        Core.unregister(jolokia, $scope);
        Core.$apply($scope);

      }

    }
  }]);
}
