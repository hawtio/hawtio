/**
 * @module JVM
 */
/// <reference path="../../core/js/coreInterfaces.ts"/>
/// <reference path="../../core/js/coreHelpers.ts"/>
/// <reference path="jvmPlugin.ts"/>
module JVM {

  _module.controller("JVM.DiscoveryController", ["$scope", "localStorage", "jolokia", ($scope, localStorage, jolokia) => {

    $scope.discovering = true;
    $scope.agents = <any> undefined;

    $scope.$watch('agents', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        $scope.selectedAgent = $scope.agents.find((a) => a['selected']);
      }
    }, true);

    $scope.closePopover = ($event) => {
      (<JQueryStatic>$)($event.currentTarget).parents('.popover').prev().popover('hide');
    };
      
    function getMoreJvmDetails(agents){
        for(var key in agents) {
            var agent=agents[key];
            if(agent.url && !agent.secured ) {
                var dedicatedJolokia=Core.createJolokia(agent.url, agent.username, agent.password);
                agent.startTime=dedicatedJolokia.getAttribute('java.lang:type=Runtime', 'StartTime');
                if(!$scope.hasName(agent)){//only look for command if agent vm is not known
                    agent.command=dedicatedJolokia.getAttribute('java.lang:type=Runtime', 'SystemProperties', 'sun.java.command');
                }
            }
        }
    }

    function doConnect(agent) {
      if (!agent.url) {
        Core.notification('warning', 'No URL available to connect to agent');
        return;
      }
      var options:Core.ConnectToServerOptions = Core.createConnectOptions();
      options.name = agent.agent_description  || 'discover-' + agent.agent_id;
      var urlObject = Core.parseUrl(agent.url);
      angular.extend(options, urlObject);
      options.userName = agent.username;
      options.password = agent.password;
      Core.connectToServer(localStorage, options);
    };

    $scope.connectWithCredentials = ($event, agent) => {
      $scope.closePopover($event);
      doConnect(agent);
    };

    $scope.gotoServer = ($event, agent) => {
      if (agent.secured) {
        (<JQueryStatic>$)($event.currentTarget).popover('show');
      } else {
        doConnect(agent);
      }
    };

    $scope.getElementId = (agent) => {
      return agent.agent_id.dasherize().replace(/\./g, "-");
    };

    $scope.getLogo = (agent) => {
      if (agent.server_product) {
        return JVM.logoRegistry[agent.server_product];
      }
      return JVM.logoRegistry['generic'];
    };

    $scope.filterMatches = (agent) => {
      if (Core.isBlank($scope.filter)) {
        return true;
      } else {
        return angular.toJson(agent).toLowerCase().has($scope.filter.toLowerCase());
      }
    };

    $scope.getAgentIdClass = (agent) => {
      if ($scope.hasName(agent)) {
        return "";
      }
      return "strong";
    };

    $scope.hasName = (agent) => {
      if (agent.server_vendor && agent.server_product && agent.server_version) {
        return true;
      }
      return false;
    };

    $scope.render = (response) => {
      $scope.discovering = false;
      if (response) {
        var responseJson = angular.toJson(response, true);
        if ($scope.responseJson !== responseJson) {
          $scope.responseJson = responseJson;
          $scope.agents = response;
          getMoreJvmDetails($scope.agents);
        }
      }
      Core.$apply($scope);
    }

    $scope.fetch = () => {
      $scope.discovering = true;
      // use 10 sec timeout
      jolokia.execute('jolokia:type=Discovery', 'lookupAgentsWithTimeout(int)', 10 * 1000, onSuccess($scope.render));
    };

    $scope.fetch();
  }]);

}
