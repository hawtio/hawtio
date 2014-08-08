module SpringBoot {

    _module.controller("SpringBoot.BeansController", ["$scope", "jolokia", ($scope, jolokia) => {
        jolokia.execute('org.springframework.boot:type=Endpoint,name=beansEndpoint', metricsMBeanOperation, onSuccess(function (data) {
            $scope.beans = data[0]['beans'];
            $scope.$apply();
        }, {error: function(){
            $scope.loadingError = 'Cannot read beans data.';
            $scope.$apply();
        }}));
    }]);

}