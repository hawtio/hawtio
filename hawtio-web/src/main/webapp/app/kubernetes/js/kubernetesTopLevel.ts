/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  export var TopLevel = controller("TopLevel", ["$scope", "workspace", ($scope, workspace:Core.Workspace) => {

    $scope.isActive = (href) => {
      return workspace.isLinkActive(href);
    }


  }]);

}
