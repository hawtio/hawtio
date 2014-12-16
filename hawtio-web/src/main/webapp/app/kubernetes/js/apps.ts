/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="../../helpers/js/pollHelpers.ts"/>
/// <reference path="../../ui/js/dialog.ts"/>
module Kubernetes {

  export var Apps = controller("Apps",
    ["$scope", "KubernetesServices", "KubernetesReplicationControllers", "KubernetesPods", "KubernetesState", "$templateCache", "$location", "$routeParams", "$http", "workspace", "jolokia",
      ($scope, KubernetesServices:ng.IPromise<ng.resource.IResourceClass>, KubernetesReplicationControllers:ng.IPromise<ng.resource.IResourceClass>, KubernetesPods:ng.IPromise<ng.resource.IResourceClass>, KubernetesState,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, $http, workspace, jolokia:Jolokia.IJolokia) => {

    $scope.namespace = $routeParams.namespace;
    $scope.apps = [];
    $scope.allApps = [];
    $scope.kubernetes = KubernetesState;
    $scope.fetched = false;
    $scope.json = '';
    ControllerHelpers.bindModelToSearchParam($scope, $location, 'id', '_id', undefined);
    ControllerHelpers.bindModelToSearchParam($scope, $location, 'appSelectorShow', 'openApp', undefined);
    var branch = $scope.branch || "master";
    var namespace = null;
    var defaultIconUrl = Core.url("/img/icons/kubernetes.svg");

    function appMatches(app) {
      var filterText = $scope.appSelector.filterText;
      if (filterText) {
        return Core.matchFilterIgnoreCase(app.groupId, filterText) ||
          Core.matchFilterIgnoreCase(app.artifactId, filterText) ||
          Core.matchFilterIgnoreCase(app.name, filterText) ||
          Core.matchFilterIgnoreCase(app.description, filterText);
      } else {
        return true;
      }
    }

    function appRunning(app) {
      return $scope.apps.any((running) => running.appPath === app.appPath);
    }

    $scope.tableConfig = {
      data: 'apps',
      showSelectionCheckbox: true,
      enableRowClickSelection: false,
      multiSelect: true,
      selectedItems: [],
      filterOptions: {
        filterText: $location.search()["q"] || ''
      },
      columnDefs: [
        { field: 'icon', displayName: 'App', cellTemplate: $templateCache.get("appIconTemplate.html") },
        { field: 'services', displayName: 'Services', cellTemplate: $templateCache.get("appServicesTemplate.html") },
        { field: 'replicationControllers', displayName: 'Controllers', cellTemplate: $templateCache.get("appReplicationControllerTemplate.html") },
        { field: '$podsLink', displayName: 'Pods', cellTemplate: $templateCache.get("appPodCountsAndLinkTemplate.html") },
        { field: 'namespace', displayName: 'Namespace' }
      ]
    };

    Kubernetes.initShared($scope, $location);

    $scope.$on('kubeSelectedId', ($event, id) => {
      Kubernetes.setJson($scope, id, $scope.apps);
    });

    $scope.$on('$routeUpdate', ($event) => {
      Kubernetes.setJson($scope, $location.search()['_id'], $scope.apps);
    });

    if (isKubernetes(workspace)) {
      Core.register(jolokia, $scope, {type: 'exec', mbean: Kubernetes.mbean, operation: "findApps", arguments: [branch]}, onSuccess(onAppData));
    }
    if (isAppView(workspace)) {
      Core.register(jolokia, $scope, {type: 'exec', mbean: Kubernetes.appViewMBean, operation: "findAppSummariesJson"}, onSuccess(onAppViewData));
    }

    function deleteApp(app, onCompleteFn) {
      function deleteServices(services, service, onCompletedFn) {
        if (!service || !services) {
          return onCompletedFn();
        }
        var id = service.id;
        if (!id) {
          log.warn("No ID for service " + angular.toJson(service));
        } else {
          KubernetesServices.then((KubernetesServices:ng.resource.IResourceClass) => {
            KubernetesServices.delete({
              id: id
            }, undefined, () => {
              log.debug("Deleted service: ", id);
              deleteServices(services, services.shift(), onCompletedFn);
            }, (error) => {
              log.debug("Error deleting service: ", error);
              deleteServices(services, services.shift(), onCompletedFn);
            });
          });
        }
      }

      function deleteReplicationControllers(replicationControllers, replicationController, onCompletedFn) {
        if (!replicationController || !replicationControllers) {
          return onCompletedFn();
        }
        var id = replicationController.id;
        if (!id) {
          log.warn("No ID for replicationController " + angular.toJson(replicationController));
        } else {
          KubernetesReplicationControllers.then((KubernetesReplicationControllers:ng.resource.IResourceClass) => {
            KubernetesReplicationControllers.delete({
              id: id
            }, undefined, () => {
              log.debug("Deleted replicationController: ", id);
              deleteReplicationControllers(replicationControllers, replicationControllers.shift(), onCompletedFn);
            }, (error) => {
              log.debug("Error deleting replicationController: ", error);
              deleteReplicationControllers(replicationControllers, replicationControllers.shift(), onCompletedFn);
            });
          });
        }
      }

      function deletePods(pods, pod, onCompletedFn) {
        if (!pod || !pods) {
          return onCompletedFn();
        }
        var id = pod.id;
        if (!id) {
          log.warn("No ID for pod " + angular.toJson(pod));
        } else {
          KubernetesPods.then((KubernetesPods:ng.resource.IResourceClass) => {
            KubernetesPods.delete({
              id: id
            }, undefined, () => {
              log.debug("Deleted pod: ", id);
              deletePods(pods, pods.shift(), onCompletedFn);
            }, (error) => {
              log.debug("Error deleting pod: ", error);
              deletePods(pods, pods.shift(), onCompletedFn);
            });
          });
        }
      }

      var services = [].concat(app.services);
      deleteServices(services, services.shift(), () => {

        var replicationControllers = [].concat(app.replicationControllers);
        deleteReplicationControllers(replicationControllers, replicationControllers.shift(), () => {

          var pods = [].concat(app.pods);
          deletePods(pods, pods.shift(), onCompleteFn);
        });
      });
    }

    $scope.deletePrompt = (selected) => {
      if (angular.isString(selected)) {
        selected = [{
          id: selected
        }];
      }
      UI.multiItemConfirmActionDialog(<UI.MultiItemConfirmActionOptions>{
        collection: selected,
        index: '$name',
        onClose: (result:boolean) => {
          if (result) {
            function deleteSelected(selected, next) {
              if (next) {
                var id = next.name;
                log.debug("deleting: ", id);
                deleteApp(next, () => {
                  log.debug("deleted: ", id);
                  deleteSelected(selected, selected.shift());
                });
              }
            }

            deleteSelected(selected, selected.shift());
          }
        },
        title: 'Delete Apps?',
        action: 'The following Apps will be deleted:',
        okText: 'Delete',
        okClass: 'btn-danger',
        custom: "This operation is permanent once completed!",
        customClass: "alert alert-warning"
      }).open();
    };


    $scope.appSelector = {
      filterText: "",
      folders: [],
      selectedApps: [],

      isOpen: (folder) => {
        if ($scope.appSelector.filterText !== '' || folder.expanded) {
          return "opened";
        }
        return "closed";
      },

      getSelectedClass: (app) => {
        if (app.abstract) {
          return "abstract";
        }
        if (app.selected) {
          return "selected";
        }
        return "";
      },

      showApp: (app) => {
        return appMatches(app) && !appRunning(app);
      },

      showFolder: (folder) => {
        return !$scope.appSelector.filterText || folder.apps.some((app) => appMatches(app) && !appRunning(app));
      },

      clearSelected: () => {
        angular.forEach($scope.appSelector.folders, (folder) => {
          angular.forEach(folder.apps, (app) => {
            app.selected = false;
          });
        });
        $scope.appSelector.selectedApps = [];
        Core.$apply($scope);
      },

      updateSelected: () => {
        // lets update the selected apps
        var selectedApps = [];
        angular.forEach($scope.appSelector.folders, (folder) => {
          var apps = folder.apps.filter((app) => app.selected);
          if (apps) {
            selectedApps = selectedApps.concat(apps);
          }
        });
        $scope.appSelector.selectedApps = selectedApps.sortBy("name");
      },

      select: (app, flag) => {
        app.selected = flag;
        $scope.appSelector.updateSelected();
      },

      hasSelection: () => {
        return $scope.appSelector.folders.any((folder) => folder.apps.any((app) => app.selected));
      },


      runSelectedApps: () => {
        // lets run all the selected apps
        angular.forEach($scope.appSelector.selectedApps, (app) => {
          var name = app.name;
          var metadataPath = app.metadataPath;
          if (metadataPath) {
            // lets load the json/yaml
            var url = Wiki.gitRelativeURL(branch, metadataPath);
            if (url) {
              $http.get(url).
                success(function (data, status, headers, config) {
                  if (data) {
                    // lets convert the json object structure into a string
                    var json = angular.toJson(data);
                    var fn = () => {};
                    Kubernetes.runApp($location, jolokia, $scope, json, name, fn, namespace);
                  }
                }).
                error(function (data, status, headers, config) {
                  $scope.summaryHtml = null;
                  log.warn("Failed to load " + url + " " + data + " " + status);
                });
            }
          }
        });
        // lets go back to the apps view
        $scope.appSelector.clearSelected();
        $scope.appSelectorShow = false;
      }
    };



    function updateData() {
      if ($scope.appInfos && $scope.appViews) {
        $scope.fetched = true;
        var folderMap = {};
        var folders = [];
        var appMap = {};
        angular.forEach($scope.appInfos, (appInfo) => {
          var appPath = appInfo.appPath;
          var iconPath = appInfo.iconPath;
          if (iconPath) {
            appInfo.$iconUrl = Wiki.gitRelativeURL(branch, iconPath);
          } else {
            appInfo.$iconUrl = defaultIconUrl;
          }
          if (appPath) {
            appMap[appPath] = appInfo;
            var idx = appPath.lastIndexOf("/");
            var folderPath = "";
            if (idx >= 0) {
              folderPath = appPath.substring(0, idx);
            }
            folderPath = Core.trimLeading(folderPath, "/");
            var folder = folderMap[folderPath];
            if (!folder) {
              folder = {
                path: folderPath,
                expanded: true,
                apps: []
              };
              folders.push(folder);
              folderMap[folderPath] = folder;
            }
            folder.apps.push(appInfo);
          }
        });
        $scope.appSelector.folders = folders.sortBy("path");

        var apps = [];
        angular.forEach($scope.appViews, (appView) => {
          var appPath = appView.appPath;
          if (appPath) {
            var appInfo = appMap[appPath];
            if (appInfo) {
              appView.$info = appInfo;
              appView.$name = appInfo.name;
              appView.$iconUrl = appInfo.$iconUrl;
              apps.push(appView);
            }
            appView.$appUrl = Wiki.viewLink(branch, appPath, $location);
          }
          appView.$podCounters = createAppViewPodCounters(appView);
        });
        $scope.apps = apps;
        Core.$apply($scope);
      }
    }

    function createAppViewPodCounters(appView) {
      var array = [];
      var map = {};
      var pods = appView.pods;
      angular.forEach(pods, pod => {
        var selector = pod.labels;
        var selectorText = Kubernetes.labelsToString(selector, " ");
        var answer = map[selector];
        if (!answer) {
          answer = {
            labelText: selectorText,
            podsLink: Core.url("/kubernetes/pods?q=" + encodeURIComponent(selectorText)),
            valid: 0,
            waiting: 0,
            error: 0
          };
          map[selector] = answer;
          array.push(answer);
        }
        var status = pod.status;
        if ("OK" === status) {
          answer.valid += 1;
        } else if ("WAIT" === status) {
          answer.waiting += 1;
        } else {
          answer.error += 1;
        }
      });
      return array;
    }

    function onAppData(response) {
      if (response) {
        var apps = response.value;
        var responseJson = angular.toJson(apps);
        if ($scope.responseAppJson === responseJson) {
          return;
        }
        $scope.responseAppJson = responseJson;
        $scope.appInfos = apps;
        updateData();
      }
    }

    function onAppViewData(response) {
      if (response) {
        var responseJson = response.value;
        if ($scope.responseJson === responseJson) {
          return;
        }
        var apps = [];
        if (responseJson) {
          apps = JSON.parse(responseJson);
        }
        $scope.responseJson = responseJson;
        $scope.appViews = apps;
        updateData();
      }
    }

  }]);
}
