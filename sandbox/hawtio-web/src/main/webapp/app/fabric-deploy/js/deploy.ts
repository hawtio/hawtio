/// <reference path="fabricDeployPlugin.ts"/>
/// <reference path="../../helpers/js/urlHelpers.ts"/>
module FabricDeploy {

  export var DeployArtifact = _module.directive("fabricDeployArtifact", [() => {
    log.debug("Creating deploy artifact directive...");
    return {
      restrict: 'A',
      replace: true,
      scope: {
        versionId: '@',
        profileId: '@'
      },
      templateUrl: FabricDeploy.templatePath + "deploy.html",
      controller: ["$scope", "$element", "FileUploader", "jolokiaUrl", "$templateCache", "jolokia", "userDetails", ($scope, $element, FileUploader:any, jolokiaUrl, $templateCache, jolokia, userDetails:Core.UserDetails) => {

        $scope.artifactTemplate = '';

        jolokia.request({
          type: 'read',
          mbean: Fabric.managerMBean,
          attribute: 'MavenRepoUploadURI'
        }, onSuccess((response) => {
          var uploadURI = response.value;

          //log.debug("Response: ", response);
          //log.info("Jolokia URL: ", jolokiaUrl);
          if (jolokiaUrl.has('/proxy')) {
            uploadURI = 'proxy/' + uploadURI;
          }

          log.debug("Maven upload URI: ", uploadURI);

          var uploader = $scope.artifactUploader = new FileUploader({
            headers: {
              'Authorization': Core.authHeaderValue(userDetails)
            },
            autoUpload: true,
            withCredentials: true,
            method: 'PUT',
            url: uploadURI
          });

          $scope.doUpload = () => {
            uploader.uploadAll();
          };

          uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
            log.debug('onWhenAddingFileFailed', item, filter, options);
          };
          uploader.onAfterAddingFile = function(fileItem) {
            log.debug('onAfterAddingFile', fileItem);
          };
          uploader.onAfterAddingAll = function(addedFileItems) {
            log.debug('onAfterAddingAll', addedFileItems);
          };
          uploader.onBeforeUploadItem = function(item) {
            if ('file' in item) {
              item.fileSizeMB = (item.file.size/1024/1024).toFixed(2);
            } else {
              item.fileSizeMB = 0;
            }
            item.url = UrlHelpers.join(uploadURI, item.file.name) + '?profile=' + $scope.profileId + '&version=' + $scope.versionId;
            log.debug('onBeforeUploadItem', item);
          };
          uploader.onProgressItem = function(fileItem, progress) {
            log.debug('onProgressItem', fileItem, progress);
          };
          uploader.onProgressAll = function(progress) {
            log.debug('onProgressAll', progress);
          };
          uploader.onSuccessItem = function(fileItem, response, status, headers) {
            log.debug('onSuccessItem', fileItem, response, status, headers);
            Core.notification('success', 'Added ' + fileItem.file.name);
          };
          uploader.onErrorItem = function(fileItem, response, status, headers) {
            log.debug('onErrorItem', fileItem, response, status, headers);
            Core.notification('error', 'Failed to add ' + fileItem.file.name);
          };
          uploader.onCancelItem = function(fileItem, response, status, headers) {
            log.debug('onCancelItem', fileItem, response, status, headers);
          };
          uploader.onCompleteItem = function(fileItem, response, status, headers) {
            log.debug('onCompleteItem', fileItem, response, status, headers);
          };
          uploader.onCompleteAll = function() {
            log.debug('onCompleteAll');
            uploader.clearQueue();
          };

          log.debug('uploader', uploader);
          $scope.artifactTemplate = $templateCache.get('fileUpload.html');
          Core.$apply($scope);

        }));

      }]
    };
  }]);

}
