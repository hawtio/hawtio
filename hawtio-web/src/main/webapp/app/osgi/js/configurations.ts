module Osgi {

    export function ConfigurationsController($scope, $filter:ng.IFilterService, workspace:Workspace, $templateCache:ng.ITemplateCacheService, $compile:ng.IAttributes) {
        var dateFilter = $filter('date');

        $scope.widget = new TableWidget($scope, workspace, [
            { "mDataProp": "PidLink" }

        ], {
            rowDetailTemplateId: 'configAdminPidTemplate',
            disableAddColumns: true
        });


        $scope.$on("$routeChangeSuccess", function (event, current, previous) {
            // lets do this asynchronously to avoid Error: $digest already in progress
            setTimeout(updateTableContents, 50);
        });

        $scope.$watch('workspace.selection', function () {
            if (workspace.moveIfViewInvalid()) return;
            updateTableContents();
        });

        function populateTable(response) {
            var configurations = Osgi.defaultConfigurationValues(workspace, $scope, response.value);
            $scope.widget.populateTable(configurations);
            $scope.$apply();
        }



        function updateTableContents() {
            var mbean = getSelectionConfigAdminMBean(workspace);
            if (mbean) {
                var jolokia = workspace.jolokia;
                jolokia.request(
                    {type: 'exec', mbean: mbean, operation: 'getConfigurations', arguments: ['(service.pid=*)']},
                    onSuccess(populateTable));
            }
        }
    }
}
