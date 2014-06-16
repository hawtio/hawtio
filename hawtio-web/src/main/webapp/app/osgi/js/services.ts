/**
 * @module Osgi
 */
/// <reference path="./osgiPlugin.ts"/>
module Osgi {

    _module.controller("Osgi.ServiceController", ["$scope", "$filter", "workspace", "$templateCache", "$compile", ($scope, $filter:ng.IFilterService, workspace:Workspace, $templateCache:ng.ITemplateCacheService, $compile:ng.IAttributes) => {

        var dateFilter = $filter('date');

        $scope.widget = new DataTable.TableWidget($scope, $templateCache, $compile, [
          <DataTable.TableColumnConfig> {
                "mDataProp": null,
                "sClass": "control center",
                "sDefaultContent": '<i class="icon-plus"></i>'
            },
          <DataTable.TableColumnConfig> { "mDataProp": "Identifier" },
          <DataTable.TableColumnConfig> { "mDataProp": "BundleIdentifier" },
          <DataTable.TableColumnConfig> { "mDataProp": "objectClass" }
        ], {
            rowDetailTemplateId: 'osgiServiceTemplate',
            disableAddColumns: true
        });



        $scope.$watch('workspace.selection', function () {
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
            Core.$apply($scope);
        };
    }]);
};

