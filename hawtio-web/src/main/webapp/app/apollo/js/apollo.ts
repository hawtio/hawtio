/// <referencePath="apolloPlugin.ts"/>
module Apollo {
  _module.controller("Apollo.ApolloController", ["$scope", "$http", "$location", "localStorage", "workspace", ($scope, $http, $location, localStorage, workspace:Workspace) => {
    var jolokia = workspace.jolokia;
    $scope.broker = {}
    $scope.online = true
    $scope.route = ()=> { return $location.path(); }
    $scope.apollo = {
      version:jolokia.getAttribute('org.apache.apollo:type=broker,name="default"', "Version", onSuccess(null)),
      url: jolokia.getAttribute('org.apache.apollo:type=broker,name="default"', "WebAdminUrl", onSuccess(null)),
    };
    
    var default_error_handler = function(data, status, headers, config) {
      if( status === 401 ) {
        alert("Action not authorized.")
      } else {
        alert("Error: "+status)
      }
    }
  
    $scope.ajax = function(type, path, success, error, data, binary_options) {
      if( !error ) {
        error = default_error_handler;
      }
      var username = "admin"
      var password = "password"

      var ajax_options = {
        method: type,
        url: $scope.apollo.url+"/api/json"+path,
        headers: { 
          AuthPrompt:'false' ,
          Accept: "application/json",
          ContentType: "application/json",
          Authorization: Core.getBasicAuthHeader(username, password)
        },
        cache:false,
        data:null,
      }
      if( binary_options ) {
        ajax_options.headers["Accept"] = binary_options.Accept || "application/octet-stream"
        ajax_options.headers["ContentType"] || "application/octet-stream"
        ajax_options.data = binary_options.data
      }
      
      return $http(ajax_options).
        success((data, status, headers, config) =>{
          $scope.online = true
          if( success ) {
            success(data, status, headers, config)
          }
        }).
        error((data, status, headers, config) => {
          if( status === 0 ) {
            $scope.online = false
          } else {
            $scope.online = true
            error(data, status, headers, config)
          }
        });
    };
    
    var reload = ()=>{
      if( $scope.apollo.url ) {
      $scope.ajax("GET", "/broker", (broker)=>{
          $scope.broker = broker;
          if( $scope.apollo.selected_virtual_host === undefined ) {
            $scope.apollo.selected_virtual_host = broker.virtual_hosts[0]
          }
        }, (error)=>{
          alert("fail:"+error)
        });
      } else {
        $scope.broker = {}
      }
    };
    
    var schedule_refresh = ()=>{};
    schedule_refresh = ()=> {
      setTimeout(()=> {
        reload();
        schedule_refresh();
      }, 1000);    
    };
    schedule_refresh();

    $scope.$watch('apollo.url', reload);
    $scope.$watch('online', ()=>{
      // alert("online: "+$scope.online)
    });
  }]);
}
