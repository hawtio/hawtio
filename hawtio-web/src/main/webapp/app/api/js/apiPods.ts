/**
 * @module API
 */
/// <reference path="apiPlugin.ts"/>
module API {
  _module.controller("API.ApiPodsController", ["$scope", "localStorage", "$routeParams", "$location", "jolokia", "workspace", "$compile", "$templateCache", "$http", ($scope, localStorage, $routeParams, $location, jolokia, workspace, $compile, $templateCache, $http) => {

    $scope.path = "apis";

    $scope.apis = null;
    $scope.selectedApis = [];
    $scope.initDone = false;

    var endpointsPodsURL = Core.url("/service/api-registry/endpoints/pods");
    var podURL = Core.url("/pod/");


    $scope.apiOptions = {
      //plugins: [searchProvider],
      data: 'apis',
      showFilter: false,
      showColumnMenu: false,
      filterOptions: {
        filterText: "",
        useExternalFilter: false
      },
      selectedItems: $scope.selectedApis,
      rowHeight: 32,
      showSelectionCheckbox: false,
      selectWithCheckboxOnly: true,
      columnDefs: [
        {
          field: 'serviceName',
          displayName: 'Endpoint',
          width: "***"
        },
        {
          field: 'contracts',
          displayName: 'APIs',
          cellTemplate: $templateCache.get("apiContractLinksTemplate.html"),
          width: "*"
        },
        {
          field: 'url',
          displayName: 'URL',
          cellTemplate: $templateCache.get("apiUrlTemplate.html"),
          width: "***"
        },
        {
          field: 'podId',
          displayName: 'Pod',
          cellTemplate: $templateCache.get("apiPodLinkTemplate.html"),
          width: "*"
        }
      ]
    };


    function matchesFilter(text) {
      var filter = $scope.searchFilter;
      return !filter || (text && text.has(filter));
    }

    function loadData() {
      var restURL = endpointsPodsURL;

      $http.get(restURL)
        .success((data) => {
          createFlatList(restURL, data);
        })
        .error((data) => {
          log.debug("Error fetching image repositories:", data);
          createFlatList(restURL, null);
        });
    }

    loadData();

    function createFlatList(restURL, json, path = "") {
      return processApiData($scope, json, podURL, path);
    }


  }]);
}
