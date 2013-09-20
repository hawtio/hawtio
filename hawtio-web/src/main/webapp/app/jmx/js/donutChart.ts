module Jmx {

  export function DonutChartController($scope, $routeParams, jolokia, $templateCache) {

    /*
    console.log("routeParams: ", $routeParams);


    $scope.mbean = "java.lang:type=OperatingSystem";
    $scope.total = "MaxFileDescriptorCount";
    $scope.terms = "OpenFileDescriptorCount";
    */

    $scope.mbean = $routeParams['mbean'];
    $scope.total = $routeParams['total'];
    $scope.terms = $routeParams['terms'];

    $scope.remainder = "Remaining";

    $scope.template = "";
    $scope.termsArray = $scope.terms.split(",");

    $scope.data = {
      total: 0,
      terms: []
    };

    $scope.reqs = [{type: 'read', mbean: $scope.mbean, attribute: $scope.total}];

    $scope.termsArray.forEach((term) => {
      $scope.reqs.push({type: 'read', mbean: $scope.mbean, attribute: term});
      $scope.data.terms.push({
        term: term,
        count: 0
      });
    });

    $scope.data.terms.push({
      term: $scope.remainder,
      count: 0
    });

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
      if (response.request.attribute === $scope.total) {
        $scope.data.total = response.value;
      } else {
        var term = $scope.data.terms.find((term) => {
          return term.term === response.request.attribute;
        });
        if (term) {
          term.count = response.value;
        }
        var freeTerm = $scope.data.terms.find((term) => {
          return term.term === $scope.remainder;
        });
        freeTerm.count = $scope.data.total;
        $scope.data.terms.forEach((term) => {
          if (term.term !== $scope.remainder) {
            freeTerm.count = freeTerm.count - term.count;
          }
        });
      }
      if ($scope.template === "") {
        $scope.template = $templateCache.get("donut");
      }
      // console.log("Data: ", $scope.data);
      $scope.data = Object.clone($scope.data);
      Core.$apply($scope);
    };

    Core.register(jolokia, $scope, $scope.reqs, onSuccess($scope.render));
  }

}
