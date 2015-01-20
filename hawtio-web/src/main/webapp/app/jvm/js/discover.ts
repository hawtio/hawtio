/**
 * @module JVM
 */
/// <reference path="../../core/js/coreInterfaces.ts"/>
/// <reference path="jvmPlugin.ts"/>
module JVM {

  _module.controller("JVM.DiscoveryController", ["$scope", "localStorage", "jolokia", ($scope, localStorage, jolokia) => {

    $scope.discovering = true;

    $scope.$watch('agents', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        $scope.selectedAgent = $scope.agents.find((a) => a['selected']);
      }
    }, true);

    $scope.closePopover = ($event) => {
      (<JQueryStatic>$)($event.currentTarget).parents('.popover').prev().popover('hide');
    };

    function doConnect(agent) {
      if (!agent.url) {
        Core.notification('warning', 'No URL available to connect to agent');
        return;
      }
      var options:Core.ConnectToServerOptions = Core.createConnectOptions();

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

    function render(response) {
      $scope.discovering = false;
      if (!response.value) {
        Core.$apply($scope);
        return;
      }

      var responseJson = angular.toJson(response.value.sortBy((agent) => agent['agent_id']), true);
      if ($scope.responseJson !== responseJson) {
        $scope.responseJson = responseJson;
        log.debug("agents: ", $scope.agents);
        $scope.agents = response.value;
        Core.$apply($scope);
      }
    }

    $scope.fetch = () => {
      $scope.discovering = true;
      Core.$apply($scope);

      // use 30 sec timeout
      jolokia.execute('jolokia:type=Discovery', 'lookupAgentsWithTimeout(int)', 30 * 1000, onSuccess(render));
    };

    $scope.fetch();
  }]);

}
