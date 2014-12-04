/// <reference path="kubernetesPlugin.ts"/>
/// <reference path="../../helpers/js/fileUploadHelpers.ts"/>

module Kubernetes {

  export var FileDropController = controller("FileDropController", ["$scope", "jolokiaUrl", "jolokia", "FileUploader", ($scope, jolokiaUrl, jolokia:Jolokia.IJolokia, FileUploader) => {

      $scope.uploader = <FileUpload.FileUploader> new FileUploader(<FileUpload.IOptions>{
        autoUpload: true,
        removeAfterUpload: true,
        url: jolokiaUrl
      });

      FileUpload.useJolokiaTransport($scope.uploader, jolokia, (json) => {
        log.debug("Json: ", json);
        return {
          'type': 'exec',
          mbean: Kubernetes.managerMBean,
          operation: 'apply',
          arguments: [json]
        };
      });

      $scope.uploader.onBeforeUploadItem = (item) => {
        Core.notification('info', 'Uploading ' + item);
      };

      $scope.uploader.onSuccessItem = (item:FileUpload.IFileItem) => {
        log.debug("onSuccessItem: ", item);
      };

      $scope.uploader.onErrorItem = (item, response, status) => {
        log.debug("Failed to apply, response: ", response, " status: ", status);
      }

  }]);

  export var TopLevel = controller("TopLevel", ["$scope", "workspace", "KubernetesVersion", ($scope, workspace:Core.Workspace, KubernetesVersion:ng.IPromise<ng.resource.IResourceClass>) => {

    $scope.version = undefined;

    $scope.isActive = (href) => {
      return workspace.isLinkActive(href);
    };

    $scope.kubernetes = {
      namespaces: [],
      selectedNamespace: null
    };

    KubernetesVersion.then((KubernetesVersion:ng.resource.IResourceClass) => {
      KubernetesVersion.query((response) => {
        $scope.version = response;
      });
    });

  }]);

}
