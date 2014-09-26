/// <reference path="osgiPlugin.ts"/>
/// <reference path="../../core/js/workspace.ts"/>
/// <reference path="../../ui/js/dialog.ts"/>
/// <reference path="metadata.ts"/>
/**
 * @module Osgi
 */
module Osgi {

  _module.controller("Osgi.ConfigurationsController", ["$scope", "$routeParams", "$location", "workspace", "jolokia", ($scope, $routeParams, $location, workspace:Core.Workspace, jolokia) => {
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

    $scope.addPidDialog = new UI.Dialog();

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
          Core.notification("success", "Successfully created pid: " + newPid);
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
        if (!ignorePid(pid)) {
          config["hasValue"] = true;
          config["kind"] = configKinds.pid;
          pids[pid] = config;
        }
      });
      $scope.pids = pids;

      // lets load the factory pids
      var mbean = getSelectionConfigAdminMBean($scope.workspace);
      if (mbean) {
        $scope.jolokia.execute(mbean, 'getConfigurations', '(service.factoryPid=*)',
          onSuccess(onConfigFactoryPids, errorHandler("Failed to load factory PID configurations: ")));
      }
      loadMetaType();
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
          if (pid && !ignorePid(pid)) {
            var config = pids[pid];
            if (config) {
              config["isFactoryInstance"] = true;
              $scope.jolokia.execute(mbean, 'getFactoryPid', pid, onSuccess(factoryPid => {
                config["factoryPid"] = factoryPid;
                config["name"] = removeFactoryPidPrefix(pid, factoryPid);
                if (factoryPid) {
                  var factoryConfig = getOrCreatePidConfig(factoryPid, bundle, pids);
                  if (factoryConfig) {
                    configureFactoryPidConfig(pid, factoryConfig, config);
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

    function updateMetaType(lazilyCreateConfigs = true) {
      var metaType = $scope.metaType;
      if (metaType) {
        var pidMetadata = Osgi.configuration.pidMetadata;
        var pids = $scope.pids || {};
        angular.forEach(metaType.pids, (value, pid) => {
          var bundle = null;
          var config = lazilyCreateConfigs ? getOrCreatePidConfig(pid, bundle) : pids[pid];
          if (config) {
            var factoryPidBundleIds = value.factoryPidBundleIds;
            if (factoryPidBundleIds && factoryPidBundleIds.length) {
              setFactoryPid(config);
            }
            config["name"] = Core.pathGet(pidMetadata, [pid, "name"]) || trimUnnecessaryPrefixes(value.name) || pid;
            var description = Core.pathGet(pidMetadata, [pid, "description"]) || value.description;
/*
            if (description) {
              description = description + "\n" + pidBundleDescription(pid, config.bundle);
            }
*/
            config["description"] = description;
          }
        });
      }
      updateConfigurations();
    }

    function loadMetaType() {
      if ($scope.pids) {
        if ($scope.profileNotRunning && $scope.profileMetadataMBean && $scope.versionId && $scope.profileId) {
          jolokia.execute($scope.profileMetadataMBean, "metaTypeSummary", $scope.versionId, $scope.profileId, onSuccess(onMetaType));
        } else {
          var metaTypeMBean = getMetaTypeMBean($scope.workspace);
          if (metaTypeMBean) {
            $scope.jolokia.execute(metaTypeMBean, "metaTypeSummary", onSuccess(onMetaType));
          }
        }
      }
    }

    function updateTableContents() {
      $scope.configurations = [];
      if ($scope.profileNotRunning && $scope.profileMetadataMBean && $scope.versionId && $scope.profileId) {
        jolokia.execute($scope.profileMetadataMBean, "metaTypeSummary",
          $scope.versionId, $scope.profileId, onSuccess(onProfileMetaType, {silent: true}));
      } else {
        if ($scope.jolokia) {
          var mbean = getSelectionConfigAdminMBean($scope.workspace);
          if (mbean) {
            $scope.jolokia.execute(mbean, 'getConfigurations', '(service.pid=*)', onSuccess(onConfigPids, errorHandler("Failed to load PID configurations: ")));
          }
        }
      }
    }

    function onProfileMetaType(response) {
      var metaType = response;
      if (metaType) {
        var pids = {};
        angular.forEach(metaType.pids, (value, pid) => {
          if (value && !ignorePid(pid)) {
            // TODO we don't have a bundle ID
            var bundle = "mvn:" + pid;
            var config = {
              pid: pid,
              name: value.name,
              class: 'pid',
              description: value.description,
              bundle: bundle,
              kind: configKinds.pid,
              pidLink: createPidLink(pid)
            };
            pids[pid] = config;
          }
        });
        angular.forEach(pids, (config, pid) => {
          var idx = pid.indexOf('-');
          if (idx > 0) {
            var factoryPid = pid.substring(0, idx);
            var name = pid.substring(idx + 1, pid.length);
            var factoryConfig = pids[factoryPid];
            if (!factoryConfig) {
              var bundle = config.bundle;
              factoryConfig = getOrCreatePidConfig(factoryPid, bundle, pids);
            }
            if (factoryConfig) {
              configureFactoryPidConfig(pid, factoryConfig, config, factoryPid);
              config.name = name;
              pids[factoryPid] = factoryConfig;

              // lets remove the pid instance as its now a child of the factory
              delete pids[pid];
            }
          }
        });
        $scope.pids = pids;
      }

      // now lets process the response and replicate the getConfigurations / getProperties API
      // calls on the OSGi API
      // to get the tree of factory pids or pids
      $scope.metaType = metaType;
      updateMetaType(false);
    }

    function trimUnnecessaryPrefixes(name) {
      angular.forEach(["Fabric8 ", "Apache "], (prefix) => {
        if (name && name.startsWith(prefix) && name.length > prefix.length) {
          name = name.substring(prefix.length);
        }
      });
      return name;
    }

    function pidBundleDescription(pid, bundle) {
      var pidMetadata = Osgi.configuration.pidMetadata;
      return Core.pathGet(pidMetadata, [pid, "description"]) || "pid: " + pid + "\nbundle: " + bundle;
    }

    function createPidConfig(pid, bundle) {
      var pidMetadata = Osgi.configuration.pidMetadata;
      var config = {
        pid: pid,
        name: Core.pathGet(pidMetadata, [pid, "name"]) || pid,
        class: 'pid',
        description: Core.pathGet(pidMetadata, [pid, "description"]) || pidBundleDescription(pid, bundle),
        bundle: bundle,
        kind: configKinds.pidNoValue,
        pidLink: createPidLink(pid)
      };
      return config;
    }

    function ignorePid(pid) {
      var answer = false;
      angular.forEach(Osgi.configuration.ignorePids, (pattern) => {
        if (pid.startsWith(pattern)) {
          answer = true;
        }
      });
      return answer;
    }

    function getOrCreatePidConfig(pid, bundle, pids = null) {
      if (ignorePid(pid)) {
        log.info("ignoring pid " + pid);
        return null;
      } else {
        if (!pids) {
          pids = $scope.pids;
        }
        var factoryConfig = pids[pid];
        if (!factoryConfig) {
          factoryConfig = createPidConfig(pid, bundle);
          pids[pid] = factoryConfig;
          updateConfigurations();
        }
        return factoryConfig;
      }
    }

    function configureFactoryPidConfig(pid, factoryConfig, config, factoryPid = null) {
      setFactoryPid(factoryConfig, factoryPid, pid);
      //config["pidLink"] = createPidLink(pid, factoryPid);
      var children = factoryConfig.children;
      if (factoryPid) {
        factoryConfig.pidLink = createPidLink(factoryPid, true);
      }
      if (!children) {
        children = {};
        factoryConfig["children"] = children;
      }
      children[pid] = config;
    }


    function setFactoryPid(factoryConfig, factoryPid = null, pid = null) {
      factoryConfig["isFactory"] = true;
      factoryConfig["class"] = "factoryPid";
      factoryConfig["kind"] = configKinds.factory;
      if (!factoryPid) {
        factoryPid = factoryConfig["factoryPid"] || "";
      }
      if (!pid) {
        pid = factoryConfig["pid"] || "";
      }
      if (!factoryPid) {
        factoryPid = pid;
        pid = null;
      }
      factoryConfig["pidLink"] = createPidLink(factoryPid);
    }

    function createPidLink(pid, isFactory = false) {
      return createConfigPidLink($scope, workspace, pid, isFactory);
    }

    function errorHandler(message) {
      return {
        error: (response) => {
          Core.notification("error", message + response['error'] || response);
          Core.defaultJolokiaErrorHandler(response);
        }
      };
    }
  }]);
}
