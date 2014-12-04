/**
 * @module Osgi
 */
/// <reference path="./osgiPlugin.ts"/>
module Osgi {

  export var ServiceController = _module.controller("Osgi.ServiceController", ["$scope", "$filter", "workspace", "$templateCache", "$compile", ($scope, $filter:ng.IFilterService, workspace:Workspace, $templateCache:ng.ITemplateCacheService, $compile:ng.IAttributes) => {

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

    $scope.$watch('workspace.selection', function() {
      var mbean = getSelectionServiceMBean(workspace);
      if (mbean) {
        var jolokia = workspace.jolokia;
        jolokia.request({
              type: 'exec',
              mbean: mbean,
              operation: 'listServices()'
            },
            onSuccess(populateTable));
      }
    });

    var populateTable = function(response) {
      var services = Osgi.defaultServiceValues(workspace, $scope, response.value);
      augmentServicesInfo(services);
    };

    function augmentServicesInfo(services) {
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
        angular.forEach(services, function(s, key) {
          angular.forEach(s["UsingBundles"], function(b, key) {
            s["UsingBundles"][key] = bundleMap[b];
          });
        });
        $scope.widget.populateTable(services);
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

  }]);
}
