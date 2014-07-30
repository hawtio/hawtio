/// <reference path="fabricDeployPlugin.ts"/>
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

        function addFileName(url:string, filename:string) {
          if (url.endsWith('/')) {
            return url + filename;
          } else {
            return url + '/' + filename;
          } 
        }

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
          }

          uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
            console.info('onWhenAddingFileFailed', item, filter, options);
          };
          uploader.onAfterAddingFile = function(fileItem) {
            console.info('onAfterAddingFile', fileItem);
          };
          uploader.onAfterAddingAll = function(addedFileItems) {
            console.info('onAfterAddingAll', addedFileItems);
          };
          uploader.onBeforeUploadItem = function(item) {
            if ('file' in item) {
              item.fileSizeMB = (item.file.size/1024/1024).toFixed(2);
            } else {
              item.fileSizeMB = 0;
            }
            item.url = addFileName(uploadURI, item.file.name) + '?profile=' + $scope.profileId + '&version=' + $scope.versionId;
            console.info('onBeforeUploadItem', item);
          };
          uploader.onProgressItem = function(fileItem, progress) {
            console.info('onProgressItem', fileItem, progress);
          };
          uploader.onProgressAll = function(progress) {
            console.info('onProgressAll', progress);
          };
          uploader.onSuccessItem = function(fileItem, response, status, headers) {
            console.info('onSuccessItem', fileItem, response, status, headers);
          };
          uploader.onErrorItem = function(fileItem, response, status, headers) {
            console.info('onErrorItem', fileItem, response, status, headers);
          };
          uploader.onCancelItem = function(fileItem, response, status, headers) {
            console.info('onCancelItem', fileItem, response, status, headers);
          };
          uploader.onCompleteItem = function(fileItem, response, status, headers) {
            console.info('onCompleteItem', fileItem, response, status, headers);
          };
          uploader.onCompleteAll = function() {
            console.info('onCompleteAll');
            uploader.clearQueue();
          };

          console.info('uploader', uploader);
          $scope.artifactTemplate = $templateCache.get('fileUpload.html');
          Core.$apply($scope);

        }));

      }]
    };
  }]);

}
