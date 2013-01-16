module Osgi {

    export function ServiceController($scope, $filter:ng.IFilterService, workspace:Workspace, $templateCache:ng.ITemplateCacheService, $compile:ng.IAttributes) {
        var dateFilter = $filter('date');

        $scope.widget = new TableWidget($scope, workspace, [
            {
                "mDataProp": null,
                "sClass": "control center",
                "sDefaultContent": '<i class="icon-plus"></i>'
            },
            { "mDataProp": "Identifier" },
            { "mDataProp": "BundleIdentifier" },
            { "mDataProp": "objectClass" }
        ], {
            rowDetailTemplateId: 'osgiServiceTemplate',
            disableAddColumns: true
        });



        $scope.$watch('workspace.selection', function () {
            if (workspace.moveIfViewInvalid()) return;

            var mbean = getSelectionServiceMBean(workspace);
            if (mbean) {
                var jolokia = workspace.jolokia;
                jolokia.request(
                        {type: 'exec', mbean: mbean, operation: 'listServices()'},
                        onSuccess(populateTable));
            }
        });

        var populateTable = function (response) {
            Osgi.defaultServiceValues(workspace, $scope, response.value);
            $scope.widget.populateTable(response.value);
            $scope.$apply();
        };
    }

}
;

// TODO This should be a service
/**
 * Returns the bundle MBean
 */
function getSelectionServiceMBean(workspace:Workspace):string {
    if (workspace) {
        // lets navigate to the tree item based on paths
        var folder = workspace.tree.navigate("osgi.core", "serviceState");
        if (folder) {
            var children = folder.children;
            if (children) {
                var node = children[0];
                if (node) {
                    return node.objectName;
                }
            }
        }
    }
    return null;
}
