/**
 * @module API
 */
/// <reference path="apiPlugin.ts"/>
module API {
  _module.controller("API.ApisController", ["$scope", "localStorage", "$routeParams", "$location", "jolokia", "workspace", "$compile", "$templateCache", "$http", ($scope, localStorage, $routeParams, $location, jolokia, workspace, $compile, $templateCache, $http) => {

    $scope.path = "apis";

    $scope.apis = null;
    $scope.selectedApis = [];
    $scope.initDone = false;

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
          displayName: 'Service',
          cellTemplate: '<div class="ngCellText">{{row.entity.serviceName}}</div>',
          //width: 400
          width: "***"
        },
        {
          field: 'wadlHref',
          displayName: 'APIs',
          cellTemplate: '<div class="ngCellText">' +
            '<a ng-show="row.entity.apidocsHref" ng-href="{{row.entity.apidocsHref}}"><i class="icon-puzzle-piece"></i> Swagger</a> ' +
            '<a ng-show="row.entity.wadlHref" ng-href="{{row.entity.wadlHref}}"><i class="icon-puzzle-piece"></i> WADL</a> ' +
            '<a ng-show="row.entity.wsdlHref" ng-href="{{row.entity.wsdlHref}}"><i class="icon-puzzle-piece"></i> WSDL</a>' +
            '</div>',
          //width: 100
          width: "*"
        },
        {
          field: 'url',
          displayName: 'Endpoint',
          cellTemplate: '<div class="ngCellText"><a target="endpoint" href="{{row.entity.url}}">{{row.entity.url}}</a></div>',
          width: "***"
          //width: 300
        },
        {
          field: 'containerName',
          displayName: 'Container',
          cellTemplate: '<div class="ngCellText">{{row.entity.containerName}}</div>',
          //width: 100
          width: "*"
        }
      ]
    };


    function matchesFilter(text) {
      var filter = $scope.searchFilter;
      return !filter || (text && text.has(filter));
    }

    function loadData() {
      var restURL = Core.url("/service/api-registry/endpoints/pods");

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

    /*
     * Pulls all the properties out of the objectName and adds them to the object
     */
    function addObjectNameProperties(object) {
      var objectName = object["objectName"];
      if (objectName) {
        var properties = Core.objectNameProperties(objectName);
        if (properties) {
          angular.forEach(properties, (value, key) => {
            if (!object[key]) {
              object[key] = value;
            }
          })
        }
      }
      return null;
    }

    function createFlatList(restURL, json, path = "") {
      var array = [];
      angular.forEach(json, (value, key) => {
        var childPath = path + "/" + key;

        function addParameters(href) {
          angular.forEach(["container", "objectName"], (name) => {
            var param = value[name];
            if (param) {
              href += "&" + name + "=" + encodeURIComponent(param);
            }
          });
          return href;
        }

        // lets check if we are a services object or a folder
        var url = value["url"];
        if (url) {
          addObjectNameProperties(value);

          // lets use proxy if external URL
          url = Core.useProxyIfExternal(url);
          value["serviceName"] = Core.trimQuotes(value["service"]);
          var apidocs = value["swaggerUrl"];
          var wadl = value["wadlUrl"];
          var wsdl = value["wsdlUrl"];
          if (apidocs) {
            value["apidocsHref"] = addParameters("/hawtio-swagger/index.html?baseUri=" + url + apidocs);
          }
          if (wadl) {
            value["wadlHref"] = addParameters("#/api/wadl?wadl=" + encodeURIComponent(url + wadl));
          }
          if (wsdl) {
            value["wsdlHref"] = addParameters("#/api/wsdl?wsdl=" + encodeURIComponent(url + wsdl));
          }
        }
        array.push(value);
      });
      $scope.apis = array;
      $scope.initDone = true;
    }
  }]);
}
