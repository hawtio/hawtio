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

    function createPidConfig(pid, bundle) {
      var config = {
        pid: pid,
        name: pid,
        class: 'pid',
        description: pidBundleDescription(pid, bundle),
        bundle: bundle,
        pidLink: createPidLink(workspace, pid)
      };
      return config;
    }

    function onConfigPids(response) {
      var pids = {};
      angular.forEach(response, (row) => {
        var pid = row[0];
        var bundle = row[1];
        var config = createPidConfig(pid, bundle);
        config["hasValue"] = true;
        pids[pid] = config;
      });
      $scope.pids = pids;

      // lets load the factory pids
      var mbean = getSelectionConfigAdminMBean(workspace);
      if (mbean) {
        jolokia.execute(mbean, 'getConfigurations', '(service.factoryPid=*)', onSuccess(onConfigFactoryPids));
      } else {
        updateMetaType();
      }
    }

    function getOrCreatePidConfig(pid, bundle) {
      var pids = $scope.pids;
      var factoryConfig = pids[pid];
      if (!factoryConfig) {
        factoryConfig = createPidConfig(pid, bundle);
        pids[pid] = factoryConfig;
        updateConfigurations();
      }
      return factoryConfig;
    }

    function setFactoryPid(factoryConfig) {
      factoryConfig["isFactory"] = true;
      factoryConfig["class"] = "factoryPid";
      var factoryPid = factoryConfig["factoryPid"] || "";
      var pid = factoryConfig["pid"] || "";
      if (!factoryPid) {
        factoryPid = pid;
        pid = null;
      }
      factoryConfig["pidLink"] = createPidLink(workspace, pid, factoryPid);
    }
    /**
     * For each factory PID lets find the underlying PID to use to edit it, then lets make a link between them
     */
    function onConfigFactoryPids(response) {
      var mbean = getSelectionConfigAdminMBean(workspace);
      var pids = $scope.pids;
      if (pids && mbean) {
        angular.forEach(response, (row) => {
          var pid = row[0];
          var bundle = row[1];
          if (pid) {
            var config = pids[pid];
            if (config) {
              config["isFactoryInstance"] = true;
              jolokia.execute(mbean, 'getFactoryPid', pid, onSuccess(factoryPid => {
                config["factoryPid"] = factoryPid;
                if (factoryPid) {
                  var factoryConfig = getOrCreatePidConfig(factoryPid, bundle);
                  if (factoryConfig) {
                    setFactoryPid(factoryConfig);
                    var children = factoryConfig.children;
                    if (!children) {
                      children = {};
                      factoryConfig["children"] = children;
                    }
                    children[pid] = config;
                    Core.$apply($scope);
                  }
                }
              }));
            }
          }
        });
      }
      updateMetaType();
    }

    function onMetaType(response) {
      $scope.metaType = response;
      updateMetaType();
    }

    function updateConfigurations() {
      var pids = $scope.pids;
      var configurations = [];
      angular.forEach(pids, (config, pid) => {
        if (!config["isFactoryInstance"]) {
          configurations.push(config);
        }
      });
      $scope.configurations = configurations.sortBy("name");
      Core.$apply($scope);
    }

    function updateMetaType() {
      var metaType = $scope.metaType;
      if (metaType) {
        angular.forEach(metaType.pids, (value, pid) => {
          var bundle = null;
          var config = getOrCreatePidConfig(pid, bundle);
          if (config) {
            var factoryPidBundleIds = value.factoryPidBundleIds;
            if (factoryPidBundleIds && factoryPidBundleIds.length) {
              setFactoryPid(config);
            }
            config["name"] = value.name || pid;
            var description = value.description;
            if (description) {
              config["description"] = description + "\n" + pidBundleDescription(pid, config.bundle);
            }
          }
        });
      }
      updateConfigurations();
    }


    function updateTableContents() {
      $scope.configurations = [];
      var mbean = getSelectionConfigAdminMBean(workspace);
      if (mbean) {
        jolokia.execute(mbean, 'getConfigurations', '(service.pid=*)', onSuccess(onConfigPids));
      }
      var metaTypeMBean = getMetaTypeMBean(workspace);
      if (metaTypeMBean) {
        jolokia.execute(metaTypeMBean, "metaTypeSummary", onSuccess(onMetaType));
      }
    }
  }
}
