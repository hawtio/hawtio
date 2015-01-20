/// <reference path="fabricPlugin.ts"/>
module Fabric {
  _module.controller("Fabric.FabricApisController", ["$scope", "localStorage", "$routeParams", "$location", "jolokia", "workspace", "$compile", "$templateCache", ($scope, localStorage, $routeParams, $location, jolokia, workspace, $compile, $templateCache) => {

    $scope.path = "apis";

    Fabric.initScope($scope, $location, jolokia, workspace);

    $scope.apis = null;
    $scope.selectedApis = [];
    $scope.initDone = false;

    $scope.versionId = Fabric.getDefaultVersionId(jolokia);

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
          field: 'container',
          displayName: 'Container',
          cellTemplate: '<div class="ngCellText"><span fabric-container-link="{{row.entity.container}}"/></div>',
          //width: 100
          width: "*"
        },
        {
          field: 'version',
          displayName: 'Version',
          cellTemplate: '<div class="ngCellText">{{row.entity.version}}</div>',
          //width: 100
          width: "*"
        },
        {
          field: 'endpoint',
          displayName: 'Location',
          cellTemplate: '<div class="ngCellText"><a target="endpoint" href="{{row.entity.endpoint}}">{{row.entity.endpoint}}</a></div>',
          width: "***"
          //width: 300
        }
      ]
    };


    function matchesFilter(text) {
      var filter = $scope.searchFilter;
      return !filter || (text && text.has(filter));
    }

    if (Fabric.fabricCreated(workspace)) {
      var query = {type: 'exec', mbean: Fabric.managerMBean, operation: 'clusterJson', arguments: [$scope.path]};
      scopeStoreJolokiaHandle($scope, jolokia, jolokia.register(onClusterData, query));
    }

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

    function createFlatList(array, json, path = "") {
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
        var services = value["services"];
        if (services && angular.isArray(services) && value["id"]) {
          value["path"] = childPath;
          if (services.length) {
            var url = services[0];
            value["endpoint"] = url;
            addObjectNameProperties(value);

            // lets use proxy if external URL
            url = Core.useProxyIfExternal(url);
            value["serviceName"] = Core.trimQuotes(value["service"]);
            var apidocs = value["apidocs"];
            var wadl = value["wadl"];
            var wsdl = value["wsdl"];
            if (apidocs) {
              value["apidocsHref"] = addParameters("/hawtio-swagger/index.html?baseUri=" + url + apidocs);
            }
            if (wadl) {
              value["wadlHref"] = addParameters("#/fabric/api/wadl?wadl=" + encodeURIComponent(url + wadl));
            }
            if (wsdl) {
              value["wsdlHref"] = addParameters("#/fabric/api/wsdl?wsdl=" + encodeURIComponent(url + wsdl));
            }
          }
          array.push(value);
        } else {
          createFlatList(array, value, childPath);
        }
      });
    }

    function onClusterData(response) {
      $scope.initDone = true;

      var responseJson = null;
      if (response) {
        responseJson = response.value;
      }
      if ($scope.responseJson === responseJson) {
        return;
      }
      $scope.apis = [];
      $scope.responseJson = responseJson;

      try {
        var json = JSON.parse(responseJson);
        createFlatList($scope.apis, json);
        Core.$apply($scope);
      } catch (e) {
        console.log("Failed to parse JSON " + e);
        console.log("JSON: " + responseJson);
      }
    }

  }]);
}
