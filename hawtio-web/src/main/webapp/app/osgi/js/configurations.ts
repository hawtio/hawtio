/**
 * @module Osgi
 */
module Osgi {

  export function ConfigurationsController($scope, $filter:ng.IFilterService, workspace:Workspace, $templateCache:ng.ITemplateCacheService, $compile:ng.IAttributes, jolokia) {
    var dateFilter = $filter('date');

    $scope.addPidDialog = new Core.Dialog();

    $scope.widget = new TableWidget($scope, workspace, [
      { "mDataProp": "PidLink" }

    ], {
      rowDetailTemplateId: 'configAdminPidTemplate',
      disableAddColumns: true
    });

    $scope.addPid = (newPid) => {
      $scope.addPidDialog.close();

      var mbean = getHawtioConfigAdminMBean(workspace);
      if (mbean) {
        jolokia.request({
          type: "exec",
          mbean: mbean,
          operation: "configAdminUpdate",
          arguments: [newPid, JSON.stringify({})]
        }, {
          error: function (response) {
            notification("error", response.error);
          },
          success: function (response) {
            notification("success", "Successfully created pid: " + newPid);
            updateTableContents();
          }
        });
      }
    };

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateTableContents, 50);
    });

    $scope.$watch('workspace.selection', function () {
      updateTableContents();
    });

    function populateTable(response) {
      var configurations = Osgi.defaultConfigurationValues(workspace, $scope, response.value);
      $scope.widget.populateTable(configurations);
      Core.$apply($scope);
    }

    function updateTableContents() {
      var mbean = getSelectionConfigAdminMBean(workspace);
      if (mbean) {
        jolokia.request(
          {type: 'exec', mbean: mbean, operation: 'getConfigurations', arguments: ['(service.pid=*)']},
          onSuccess(populateTable));
      }
    }
  }
}
