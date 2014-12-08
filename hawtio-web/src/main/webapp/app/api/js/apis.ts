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
          displayName: 'Service',
          cellTemplate: '<div class="ngCellText">{{row.entity.serviceName}}</div>',
          //width: 400
          width: "***"
        },
        {
          field: 'wadlHref',
          displayName: 'APIs',
          cellTemplate: '<div class="ngCellText">' +
            '<a ng-show="row.entity.apidocsHref" ng-href="{{row.entity.apidocsHref}}" target="swagger"><i class="icon-puzzle-piece"></i> Swagger</a> ' +
            '<a ng-show="row.entity.wadlHref" ng-href="{{row.entity.wadlHref}}" target="wadl"><i class="icon-puzzle-piece"></i> WADL</a> ' +
            '<a ng-show="row.entity.wsdlHref" ng-href="{{row.entity.wsdlHref}}" target="wsdl"><i class="icon-puzzle-piece"></i> WSDL</a>' +
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
          field: 'podId',
          displayName: 'Pod',
          cellTemplate: '<div class="ngCellText">{{row.entity.podId}}</div>',
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
          angular.forEach(["podId", "port", "objectName"], (name) => {
            var param = value[name];
            if (param) {
              href += "&" + name + "=" + encodeURIComponent(param);
            }
          });
          return href;
        }

        // lets check if we are a services object or a folder
        var path = value["path"];
        var url = value["url"];
        if (url) {
          addObjectNameProperties(value);

          value["serviceName"] = Core.trimQuotes(value["service"]) || value["containerName"];
          var podId = value["podId"];
          if (podId) {
            var port = value["port"] || 8080;
            var prefix = podURL + podId + "/" + port;

            function addPrefix(text) {
              return (text) ? prefix + text : null;
            }

            function maybeUseProxy(value) {
              if (value) {
                return Core.useProxyIfExternal(value);
              } else {
                return value;
              }
            }

            //var url = addPrefix(path);
            // no need to use the proxy as we're using local URIs
            //url = Core.useProxyIfExternal(url);
            //value["url"] = url;
            var apidocs = maybeUseProxy(value["swaggerUrl"]) || addPrefix(value["swaggerPath"]);
            var wadl = maybeUseProxy(value["wadlUrl"]) || addPrefix(value["wadlPath"]);
            var wsdl = maybeUseProxy(value["wsdlUrl"]) || addPrefix(value["wsdlPath"]);
            if (apidocs) {
              value["apidocsHref"] = addParameters("/hawtio-swagger/index.html?baseUri=" + apidocs);
            }
            if (wadl) {
              value["wadlHref"] = addParameters("#/api/wadl?wadl=" + encodeURIComponent(wadl));
            }
            if (wsdl) {
              value["wsdlHref"] = addParameters("#/api/wsdl?wsdl=" + encodeURIComponent(wsdl));
            }
          }
        }
        array.push(value);
      });
      $scope.apis = array;
      $scope.initDone = true;
    }
  }]);
}
