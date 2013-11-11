module Fabric {

  export function FabricApisController($scope, localStorage, $routeParams, $location, jolokia, workspace, $compile, $templateCache) {

    $scope.path = "apis";

    Fabric.initScope($scope, $location, jolokia, workspace);

    function matchesFilter(text) {
      var filter = $scope.searchFilter;
      return !filter || (text && text.has(filter));
    }

    if (Fabric.fabricCreated(workspace)) {
      Core.register(jolokia, $scope, {
          type: 'exec',
          mbean: Fabric.managerMBean,
          operation: "clusterJson",
          arguments: [$scope.path]},
        onSuccess(onClusterData));
    }


    function createFlatList(array, json, path = "") {
      angular.forEach(json, (value, key) => {
        var childPath = path + "/" + key;

        // lets check if we are a services object or a folder
        var services = value["services"];
        if (services && angular.isArray(services) && value["id"]) {
          value["path"] = childPath;
          if (services.length) {
            var url = services[0];
            value["endpoint"]  = url;

            // lets use proxy if external URL
            url = Core.useProxyIfExternal(url);
            var apidocs = value["apidocs"];
            var wadl = value["wadl"];
            var wsdl = value["wsdl"];
            var href: string = null;
            if (apidocs) {
              href = "/hawtio-swagger/index.html?baseUri=" + url + apidocs;
            } else if (wadl) {
              // TODO!
            } else if (wsdl) {
              href =  "#/wsdl/view?wsdl=" + encodeURIComponent(url + wsdl);
            }
            if (href) {
              value["href"] = href;
            }
          }
          array.push(value);
        } else {
          createFlatList(array, value, childPath);
        }
      });
    }

    function onClusterData(response) {
      if (response && response.value) {

        var responseJson = response.value;
        if ($scope.responseJson === responseJson) {
          return;
        }

        $scope.responseJson = responseJson;

        try {
          //console.log("got JSON: " + responseJson);
          var json = JSON.parse(responseJson);
          $scope.apis = [];
          createFlatList($scope.apis, json);
          Core.$apply($scope);
        } catch (e) {
          console.log("Failed to parse JSON " + e);
          console.log("JSON: " + responseJson);
        }
      }
    }
  }
}
