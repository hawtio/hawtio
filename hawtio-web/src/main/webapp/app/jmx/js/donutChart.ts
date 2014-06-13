/**
 * @module Jmx
 */
/// <reference path="./jmxPlugin.ts"/>
module Jmx {

  _module.controller("Jmx.DonutChartController", ["$scope", "$routeParams", "jolokia", "$templateCache", ($scope, $routeParams, jolokia, $templateCache) => {

    /*
    console.log("routeParams: ", $routeParams);


    // using multiple attributes
    $scope.mbean = "java.lang:type=OperatingSystem";
    $scope.total = "MaxFileDescriptorCount";
    $scope.terms = "OpenFileDescriptorCount";
    */

    // using a single attribute with multiple paths
    /*
     $scope.mbean = "java.lang:type=Memory";
     $scope.total = "Max";
     $scope.attribute = "HeapMemoryUsage";
     $scope.terms = "Used";
     */

    $scope.mbean = $routeParams['mbean'];
    $scope.total = $routeParams['total'];
    $scope.attribute = $routeParams['attribute'];
    $scope.terms = $routeParams['terms'];

    $scope.remainder = $routeParams['remaining'];

    $scope.template = "";
    $scope.termsArray = $scope.terms.split(",");

    $scope.data = {
      total: 0,
      terms: []
    };

    if (!$scope.attribute) {
      $scope.reqs = [{type: 'read', mbean: $scope.mbean, attribute: $scope.total}];

      $scope.termsArray.forEach((term) => {
        $scope.reqs.push({type: 'read', mbean: $scope.mbean, attribute: term});
        $scope.data.terms.push({
          term: term,
          count: 0
        });
      });
    } else {

      var terms = $scope.termsArray.include($scope.total);
      $scope.reqs = [{type: 'read', mbean: $scope.mbean, attribute: $scope.attribute, paths: terms.join(",")}];

      $scope.termsArray.forEach((term) => {
        $scope.data.terms.push({
          term: term,
          count: 0
        });
      });
    }

    if ($scope.remainder && $scope.remainder !== "-") {
      $scope.data.terms.push({
        term: $scope.remainder,
        count: 0
      });
    }

    /*
    $scope.data = {
      total: 100,
      terms: [{
        term: "One",
        count: 25
      }, {
        term: "Two",
        count: 75
      }]
    };
    */

    $scope.render = (response) => {
      //console.log("got: ", response);

      var freeTerm = null;
      if ($scope.remainder && $scope.remainder !== "-") {
        freeTerm = $scope.data.terms.find((term) => {
          return term.term === $scope.remainder;
        });
      }

      if (!$scope.attribute) {
        if (response.request.attribute === $scope.total) {
          $scope.data.total = response.value;
        } else {
          var term = $scope.data.terms.find((term) => {
            return term.term === response.request.attribute;
          });
          if (term) {
            term.count = response.value;
          }

          if (freeTerm) {
            freeTerm.count = $scope.data.total;
            $scope.data.terms.forEach((term) => {
              if (term.term !== $scope.remainder) {
                freeTerm.count = freeTerm.count - term.count;
              }
            });
          }
        }
      } else {
        if (response.request.attribute === $scope.attribute) {
          $scope.data.total = response.value[$scope.total.toLowerCase()];

          $scope.data.terms.forEach((term) => {
            if (term.term !== $scope.remainder) {
              term.count = response.value[term.term.toLowerCase()];
            }
          });

          if (freeTerm) {
            freeTerm.count = $scope.data.total;
            $scope.data.terms.forEach((term) => {
              if (term.term !== $scope.remainder) {
                freeTerm.count = freeTerm.count - term.count;
              }
            });
          }
        }
      }
      if ($scope.template === "") {
        $scope.template = $templateCache.get("donut");
      }
      // console.log("Data: ", $scope.data);
      $scope.data = Object.clone($scope.data);
      Core.$apply($scope);
    };

    Core.register(jolokia, $scope, $scope.reqs, onSuccess($scope.render));
  }]);

}
