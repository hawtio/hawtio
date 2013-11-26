/**
 * @module Osgi
 */
module Osgi {

    export function PackagesController($scope, $filter:ng.IFilterService, workspace:Workspace, $templateCache:ng.ITemplateCacheService, $compile:ng.IAttributes) {
        var dateFilter = $filter('date');

        $scope.widget = new TableWidget($scope, workspace, [
          <TableColumnConfig> {
                "mDataProp": null,
                "sClass": "control center",
                "sDefaultContent": '<i class="icon-plus"></i>'
            },
          <TableColumnConfig> { "mDataProp": "Name" },
          <TableColumnConfig> { "mDataProp": "VersionLink" },
          <TableColumnConfig> { "mDataProp": "RemovalPending" }

        ], {
            rowDetailTemplateId: 'packageBundlesTemplate',
            disableAddColumns: true
        });

        $scope.$watch('workspace.selection', function () {
            updateTableContents();
        });

        function populateTable(response) {
            var packages = Osgi.defaultPackageValues(workspace, $scope, response.value);
            $scope.widget.populateTable(packages);
            Core.$apply($scope);
        }

        function updateTableContents() {
            var mbean = getSelectionPackageMBean(workspace);
            if (mbean) {
                var jolokia = workspace.jolokia;
                jolokia.request(
                    {type: 'exec', mbean: mbean, operation: 'listPackages'},
                    onSuccess(populateTable));
            }
        }
    }
}
