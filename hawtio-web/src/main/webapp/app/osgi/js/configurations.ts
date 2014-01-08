/**
 * @module Osgi
 */
module Osgi {

  export function ConfigurationsController($scope, $routeParams, $location, workspace:Workspace, jolokia) {
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

    /** the kinds of config */
    var configKinds = {
      factory: {
        class: "badge badge-info",
        title: "Configuration factory used to create separate instances of the configuration"
      },
      pid: {
        class: "badge badge-success",
        title: "Configuration which has a set of properties associated with it"
      },
      pidNoValue: {
        class: "badge badge-warning",
        title: "Configuration which does not yet have any bound values"
      }
    };

    $scope.addPidDialog = new Core.Dialog();

    initProfileScope($scope, $routeParams, $location, localStorage, jolokia, workspace, () => {
      $scope.$watch('workspace.selection', function () {
        updateTableContents();
      });

      updateTableContents();
    });

    $scope.addPid = (newPid) => {
      $scope.addPidDialog.close();
      var mbean = getHawtioConfigAdminMBean($scope.workspace);
      if (mbean && newPid) {
        var json = JSON.stringify({});
        $scope.jolokia.execute(mbean, "configAdminUpdate", newPid, json, onSuccess(response => {
          notification("success", "Successfully created pid: " + newPid);
          updateTableContents();
        }));
      }
    };

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateTableContents, 50);
    });


    function onConfigPids(response) {
      var pids = {};
      angular.forEach(response, (row) => {
        var pid = row[0];
        var bundle = row[1];
        var config = createPidConfig(pid, bundle);
        config["hasValue"] = true;
        config["kind"] = configKinds.pid;
        pids[pid] = config;
      });
      $scope.pids = pids;

      // lets load the factory pids
      var mbean = getSelectionConfigAdminMBean($scope.workspace);
      if (mbean) {
        $scope.jolokia.execute(mbean, 'getConfigurations', '(service.factoryPid=*)',
          onSuccess(onConfigFactoryPids, errorHandler("Failed to load factory PID configurations: ")));
      } else {
        updateMetaType();
      }
    }

    /**
     * For each factory PID lets find the underlying PID to use to edit it, then lets make a link between them
     */
    function onConfigFactoryPids(response) {
      var mbean = getSelectionConfigAdminMBean($scope.workspace);
      var pids = $scope.pids;
      if (pids && mbean) {
        angular.forEach(response, (row) => {
          var pid = row[0];
          var bundle = row[1];
          if (pid) {
            var config = pids[pid];
            if (config) {
              config["isFactoryInstance"] = true;
              $scope.jolokia.execute(mbean, 'getFactoryPid', pid, onSuccess(factoryPid => {
                config["factoryPid"] = factoryPid;
                config["name"] = removeFactoryPidPrefix(pid, factoryPid);
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
                    if ($scope.inFabricProfile) {
                      Osgi.getConfigurationProperties($scope.workspace, $scope.jolokia, pid, (configValues) => {
                        var zkPid = Core.pathGet(configValues, ["fabric.zookeeper.pid", "Value"]);
                        if (zkPid) {
                          config["name"] = removeFactoryPidPrefix(zkPid, factoryPid);
                          config["zooKeeperPid"] = zkPid;
                          Core.$apply($scope);
                        }
                      });
                    }
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
      if ($scope.jolokia) {
        var mbean = getSelectionConfigAdminMBean($scope.workspace);
        if (mbean) {
          $scope.jolokia.execute(mbean, 'getConfigurations', '(service.pid=*)', onSuccess(onConfigPids, errorHandler("Failed to load PID configurations: ")));
        }
        var metaTypeMBean = getMetaTypeMBean($scope.workspace);
        if (metaTypeMBean && $scope.pids) {
          $scope.jolokia.execute(metaTypeMBean, "metaTypeSummary", onSuccess(onMetaType));
        }
      }
    }

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
        kind: configKinds.pidNoValue,
        pidLink: createPidLink(pid)
      };
      return config;
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
      factoryConfig["kind"] = configKinds.factory;
      var factoryPid = factoryConfig["factoryPid"] || "";
      var pid = factoryConfig["pid"] || "";
      if (!factoryPid) {
        factoryPid = pid;
        pid = null;
      }
      factoryConfig["pidLink"] = createPidLink(pid, factoryPid);
    }

    function createPidLink(pid, factoryPid = null) {
      return createConfigPidLink($scope, workspace, pid, factoryPid);
    }

    function errorHandler(message) {
      return {
        error: (response) => {
          notification("error", message + response['error'] || response);
          Core.defaultJolokiaErrorHandler(response);
        }
      };
    }



  }
}
