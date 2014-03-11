/**
 * @module JVM
 */
module JVM {

  export function DiscoveryController($scope, $window, $location, workspace, jolokia, $element) {


    $scope.$watch('agents', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        $scope.selectedAgent = $scope.agents.find((a) => a['selected']);
      }
    }, true);

    $scope.closePopover = ($event) => {
      $($event.currentTarget).parents('.popover').prev().popover('hide');
    };

    $scope.gotoServer = ($event, agent) => {
      log.debug("agent: ", agent);
      if (agent.secured) {
        $($event.currentTarget).popover('show');
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
      if (!response.value) {
        return;
      }
      var responseJson = angular.toJson(response.value.sortBy((agent) => agent['agent_id']));
      if ($scope.responseJson !== responseJson) {
        $scope.responseJson = responseJson;
        log.debug("response: ", response);
        $scope.agents = response.value;
        Core.$apply($scope);
      }
    }

    Core.register(jolokia, $scope, {
      type: 'exec', mbean: 'jolokia:type=Discovery',
      operation: 'lookupAgentsWithTimeout',
      arguments: ['1000']
    }, onSuccess(render));

  }

}
