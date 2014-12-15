/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="../../helpers/js/pollHelpers.ts"/>
/// <reference path="../../ui/js/dialog.ts"/>
module Kubernetes {

  export var Apps = controller("Apps",
    ["$scope", "KubernetesServices", "KubernetesPods", "KubernetesState", "$templateCache", "$location", "$routeParams", "workspace", "jolokia",
      ($scope, KubernetesServices:ng.IPromise<ng.resource.IResourceClass>, KubernetesPods:ng.IPromise<ng.resource.IResourceClass>, KubernetesState,
       $templateCache:ng.ITemplateCacheService, $location:ng.ILocationService, $routeParams, workspace, jolokia:Jolokia.IJolokia) => {

    $scope.namespace = $routeParams.namespace;
    $scope.apps = [];
    $scope.allApps = [];
    $scope.kubernetes = KubernetesState;
    $scope.fetched = false;
    $scope.json = '';
    ControllerHelpers.bindModelToSearchParam($scope, $location, 'id', '_id', undefined);

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
        { field: '$podsLink', displayName: 'Pods', cellTemplate: $templateCache.get("podCountsAndLinkTemplate.html") },
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
      var branch = $scope.branch || "master";
      Core.register(jolokia, $scope, {type: 'exec', mbean: Kubernetes.mbean, operation: "findApps", arguments: [branch]}, onSuccess(onAppData));
    }
    if (isAppView(workspace)) {
      Core.register(jolokia, $scope, {type: 'exec', mbean: Kubernetes.appViewMBean, operation: "findAppSummariesJson"}, onSuccess(onAppViewData));
    }

    function updateData() {
      if ($scope.appInfos && $scope.appViews) {
        $scope.fetched = true;

        var appMap = {};
        angular.forEach($scope.appInfos, (appInfo) => {
          var appPath = appInfo.appPath;
          if (appPath) {
            appMap[appPath] = appInfo;
          }
        });
        var apps = [];
        angular.forEach($scope.appViews, (appView) => {
          var appPath = appView.appPath;
          if (appPath) {
            var appInfo = appMap[appPath];
            if (appInfo) {
              appView.$info = appInfo;
              var iconPath = appInfo.iconPath;
              if (iconPath) {
                appView.$iconUrl = Wiki.gitRelativeURL('master', iconPath);
              }
              apps.push(appView);
            }
            appView.$appUrl = Wiki.viewLink('master', appPath, $location);
          }
          appView.$podCounters = createAppViewPodCounters(appView);
        });
        $scope.apps = apps;
        Core.$apply($scope);
      }
    }

    function createAppViewPodCounters(appView) {
      var answer = {
        podsLink: "",
        valid: 0,
        waiting: 0,
        error: 0
      };
      var selector = {};
      answer.podsLink = Core.url("/kubernetes/pods?q=" + encodeURIComponent(Kubernetes.labelsToString(selector, " ")));
      var pods = appView.pods;
      angular.forEach(pods, pod => {
        var status = pod.status;
        if ("OK" === status) {
          answer.valid += 1;
        } else if ("WAIT" === status) {
          answer.waiting += 1;
        } else {
          answer.error += 1;
        }
      });
      return answer;
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
