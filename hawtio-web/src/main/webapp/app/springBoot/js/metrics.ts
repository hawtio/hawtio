module SpringBoot {

    _module.controller("SpringBoot.MetricsController", ["$scope", "jolokia", ($scope, jolokia) => {
        jolokia.execute(metricsMBean, metricsMBeanOperation, onSuccess(function (data) {
            convertRawMetricsToUserFriendlyFormat($scope, data)
        }, {error: function(){
            $scope.loadingError = 'Cannot read metrics data.';
            $scope.$apply();
        }}));
    }]);

}