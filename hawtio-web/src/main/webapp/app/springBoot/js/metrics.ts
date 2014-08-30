/// <reference path="springBootPlugin.ts"/>
/// <reference path="springBootHelpers.ts"/>
module SpringBoot {

    _module.controller("SpringBoot.MetricsController", ["$scope", "jolokia", ($scope, jolokia) => {
        jolokia.execute(metricsMBean, metricsMBeanOperation, onSuccess(function (data) {
            convertRawMetricsToUserFriendlyFormat($scope, data)
        }, {error: function(){
            $scope.loadingError = 'Cannot read metrics data.';
            $scope.$apply();
        }}));

        $scope.metricsGridOptions = {
            data: 'metrics',
            showSelectionCheckbox: false,
            sortInfo: {
                sortBy: 'key',
                ascending: true
            },
            columnDefs: [
            {
                field: 'key',
                displayName: 'Metric'
            },
            {
                field: 'value',
                displayName: 'Metric value'
            }
        ]
        }
    }]);

}