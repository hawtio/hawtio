module Osgi {

    export function BundlesController($scope, $filter:ng.IFilterService, workspace:Workspace, $templateCache:ng.ITemplateCacheService, $compile:ng.IAttributes) {
        var dateFilter = $filter('date');

        $scope.widget = new TableWidget($scope, workspace, [
            {
                "mDataProp": null,
                "sClass": "control center",
                "sDefaultContent": '<i class="icon-plus"></i>'
            },
            { "mDataProp": "IdentifierLink" },
            { "mDataProp": "SymbolicName" },
            { "mDataProp": "stateImageLink"},
            { "mDataProp": "Version" },
            { "mDataProp": "LastModified",
                "mRender": function (data, type, row) {
                    return dateFilter(data, "short");
                }
            }
        ], {
            rowDetailTemplateId: 'osgiBundleTemplate',
            disableAddColumns: true
        });


/*        $scope.$on("$routeChangeSuccess", function (event, current, previous) {
            // lets do this asynchronously to avoid Error: $digest already in progress
            setTimeout(updateTableContents, 50);
        });
*/

        $scope.$watch('workspace.selection', function () {
            if (workspace.moveIfViewInvalid()) return;
            updateTableContents();
        });

        function populateTable(response) {
            Osgi.defaultBundleValues(workspace, $scope, response.value);
            $scope.widget.populateTable(response.value);
            $scope.$apply();
        }

        function updateTableContents() {
            //console.log("Loading the bundles");
            var mbean = getSelectionBundleMBean(workspace);
            if (mbean) {
                var jolokia = workspace.jolokia;
                jolokia.request(
                        {type: 'exec', mbean: mbean, operation: 'listBundles()'},
                        onSuccess(populateTable));
            }
        }
    }
}
