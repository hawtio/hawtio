/**
 * @module Osgi
 */
module Osgi {

  export function ConfigurationsController($scope, $filter:ng.IFilterService, workspace:Workspace, $templateCache:ng.ITemplateCacheService, $compile:ng.IAttributes, jolokia) {
    $scope.selectedItems = [];

    $scope.grid = {
      data: 'configurations',
      showFilter: false,
      showColumnMenu: false,
      multiSelect: false,
      filterOptions: {
        filterText: "",
        useExternalFilter: false
      },
      selectedItems: $scope.selectedItems,
      showSelectionCheckbox: false,
      displaySelectionCheckbox: false,

      columnDefs: [
        {
          field: 'Pid',
          displayName: 'Configuration',
          cellTemplate: '<div class="ngCellText"><a ng-href="{{row.entity.pidLink}}" title="{{row.entity.description}}">{{row.entity.name}}</a></div>'
        }
      ]
    };

    $scope.addPidDialog = new Core.Dialog();

    $scope.addPid = (newPid) => {
      $scope.addPidDialog.close();
      var mbean = getHawtioConfigAdminMBean(workspace);
      if (mbean && newPid) {
        var json = JSON.stringify({});
        jolokia.execute(mbean, "configAdminUpdate", newPid, json, onSuccess(response => {
          notification("success", "Successfully created pid: " + newPid);
          updateTableContents();
        }));
      }
    };

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateTableContents, 50);
    });

    $scope.$watch('workspace.selection', function () {
      updateTableContents();
    });

    function pidBundleDescription(pid, bundle) {
      return  "pid: " + pid + "\nbundle: " + bundle;
    }
    function populateTable(response) {
      var configurations = [];
      var pids = {};
      angular.forEach(response, (row) => {
        var pid = row[0];
        var bundle = row[1];
        var config = {
          pid: pid,
          name: pid,
          description: pidBundleDescription(pid, bundle),
          bundle: bundle,
          pidLink: url("#/osgi/pid/" + pid + workspace.hash())
        };
        configurations.push(config);
        pids[pid] = config;
      });
      $scope.configurations = configurations;
      $scope.pids = pids;
      updateMetaType();
    }

    function onMetaType(response) {
      $scope.metaType = response;
      updateMetaType();
    }

    function updateMetaType() {
      var pids = $scope.pids;
      var metaType = $scope.metaType;
      if (pids && metaType) {
        angular.forEach(metaType.pids, (value, pid) => {
          var config = pids[pid];
          if (config) {
            config["name"] = value.name || pid;
            var description = value.description;
            if (description) {
              config["description"] = description + "\n" + pidBundleDescription(pid, config.bundle);
            }
          }
        });
      }
      $scope.configurations = $scope.configurations.sortBy("name");
      Core.$apply($scope);
    }

    function updateTableContents() {
      var mbean = getSelectionConfigAdminMBean(workspace);
      if (mbean) {
        jolokia.execute(mbean, 'getConfigurations', '(service.pid=*)', onSuccess(populateTable));
      }
      var metaTypeMBean = getMetaTypeMBean(workspace);
      if (metaTypeMBean) {
        jolokia.execute(metaTypeMBean, "metaTypeSummary", onSuccess(onMetaType));
      }
    }
  }
}
