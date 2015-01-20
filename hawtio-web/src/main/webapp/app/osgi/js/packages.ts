/**
 * @module Osgi
 */
/// <reference path="./osgiPlugin.ts"/>
module Osgi {

  export var PackagesController = _module.controller("Osgi.PackagesController", ["$scope", "$filter", "workspace", "$templateCache", "$compile", ($scope, $filter:ng.IFilterService, workspace:Workspace, $templateCache:ng.ITemplateCacheService, $compile:ng.IAttributes) => {
    var dateFilter = $filter('date');

    $scope.widget = new DataTable.TableWidget($scope, $templateCache, $compile, [
      <DataTable.TableColumnConfig> {
        "mDataProp": null,
        "sClass": "control center",
        "sDefaultContent": '<i class="icon-plus"></i>'
      },
      <DataTable.TableColumnConfig> { "mDataProp": "Name" },
      <DataTable.TableColumnConfig> { "mDataProp": "VersionLink" },
      <DataTable.TableColumnConfig> { "mDataProp": "RemovalPending" }

    ], {
      rowDetailTemplateId: 'packageBundlesTemplate',
      disableAddColumns: true
    });

    $scope.$watch('workspace.selection', function() {
      updateTableContents();
    });

    function populateTable(response) {
      var packages = Osgi.defaultPackageValues(workspace, $scope, response.value);
      augmentPackagesInfo(packages);
    }

    function augmentPackagesInfo(packages) {
      var bundleMap = {};
      var createBundleMap = function(response) {
        angular.forEach(response.value, function(value, key) {
          var obj = {
            Identifier: value.Identifier,
            Name: "",
            SymbolicName: value.SymbolicName,
            State: value.State,
            Version: value.Version,
            LastModified: value.LastModified,
            Location: value.Location
          };
          if (value.Headers['Bundle-Name']) {
            obj.Name = value.Headers['Bundle-Name']['Value'];
          }
          bundleMap[obj.Identifier] = obj;
        });
        angular.forEach(packages, function(p, key) {
          angular.forEach(p["ExportingBundles"], function(b, key) {
            p["ExportingBundles"][key] = bundleMap[b];
          });
          angular.forEach(p["ImportingBundles"], function(b, key) {
            p["ImportingBundles"][key] = bundleMap[b];
          });
        });
        $scope.widget.populateTable(packages);
        Core.$apply($scope);
       };
      workspace.jolokia.request({
            type: 'exec',
            mbean: getSelectionBundleMBean(workspace),
            operation: 'listBundles()'
          },
          {
            success: createBundleMap,
            error: createBundleMap
          });
    }

    function updateTableContents() {
      var mbean = getSelectionPackageMBean(workspace);
      if (mbean) {
        var jolokia = workspace.jolokia;
        // bundles first:
        jolokia.request({
              type: 'exec',
              mbean: mbean,
              operation: 'listPackages'
            },
            onSuccess(populateTable));
      }
    }
  }]);
}
