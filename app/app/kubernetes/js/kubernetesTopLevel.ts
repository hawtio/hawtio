/// <reference path="kubernetesPlugin.ts"/>

module Kubernetes {

  export var TopLevel = controller("TopLevel", ["$scope", "workspace", "KubernetesVersion", ($scope, workspace:Core.Workspace, KubernetesVersion:ng.IPromise<ng.resource.IResourceClass>) => {

    $scope.version = undefined;

    $scope.isActive = (href) => {
      return workspace.isLinkActive(href);
    }

    KubernetesVersion.then((KubernetesVersion:ng.resource.IResourceClass) => {
      KubernetesVersion.query((response) => {
        $scope.version = response;
      });
    });

  }]);

}
