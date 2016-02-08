/**
 * @module Osgi
 */
/// <reference path="./osgiPlugin.ts"/>
module Osgi {

    _module.controller("Osgi.PackageController", ["$scope", "$filter", "workspace", "$routeParams", ($scope, $filter:ng.IFilterService, workspace:Workspace, $routeParams) => {
        $scope.package = $routeParams.package;
        $scope.version = $routeParams.version;

        updateTableContents();

        function populateTable(response) {
            var packages = Osgi.defaultPackageValues(workspace, $scope, response.value);
            $scope.row = packages.filter({"Name":  $scope.package,  "Version": $scope.version})[0];
            Core.$apply($scope);
        };

        function updateTableContents() {
            var mbean = getSelectionPackageMBean(workspace);
            if (mbean) {
                var jolokia = workspace.jolokia;
                jolokia.request(
                    {type: 'exec', mbean: mbean, operation: 'listPackages'},
                    onSuccess(populateTable));
            }
        }
    }]);
}
