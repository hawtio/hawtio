/// <reference path="wikiDropPlugin.ts"/>
/// <reference path="../../helpers/js/urlHelpers.ts"/>
/// <reference path="../../wiki/js/wikiHelpers.ts"/>
module WikiDrop {

  export var DropFile = _module.directive("wikiDropFile", [() => {
    log.debug("Creating wiki drop directive...");
    return {
      restrict: 'A',
      replace: true,
      scope: {
        branch: '@',
        path: '@'
      },
      templateUrl: WikiDrop.templatePath + "deploy.html",
      controller: ["$scope", "$element", "FileUploader", "jolokiaUrl", "$templateCache", "jolokia", "userDetails", ($scope, $element, FileUploader:any, jolokiaUrl, $templateCache, jolokia, userDetails:Core.UserDetails) => {

        $scope.artifactTemplate = '';


        function updateURL() {
          var uploadURI = Wiki.gitRestURL($scope.branch, $scope.path);
          log.info("Upload URI: " + uploadURI);

          var uploader = $scope.artifactUploader = new FileUploader({
            headers: {
              'Authorization': Core.authHeaderValue(userDetails)
            },
            autoUpload: true,
            withCredentials: true,
            method: 'POST',
            url: uploadURI
          });

          $scope.doUpload = () => {
            uploader.uploadAll();
          };

          uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
            log.debug('onWhenAddingFileFailed', item, filter, options);
          };
          uploader.onAfterAddingFile = function (fileItem) {
            log.debug('onAfterAddingFile', fileItem);
          };
          uploader.onAfterAddingAll = function (addedFileItems) {
            log.debug('onAfterAddingAll', addedFileItems);
          };
          uploader.onBeforeUploadItem = function (item) {
            if ('file' in item) {
              item.fileSizeMB = (item.file.size / 1024 / 1024).toFixed(2);
            } else {
              item.fileSizeMB = 0;
            }
            //item.url = UrlHelpers.join(uploadURI, item.file.name);
            item.url = uploadURI;
            log.info("Loading files to " + uploadURI);
            log.debug('onBeforeUploadItem', item);
          };
          uploader.onProgressItem = function (fileItem, progress) {
            log.debug('onProgressItem', fileItem, progress);
          };
          uploader.onProgressAll = function (progress) {
            log.debug('onProgressAll', progress);
          };
          uploader.onSuccessItem = function (fileItem, response, status, headers) {
            log.debug('onSuccessItem', fileItem, response, status, headers);
          };
          uploader.onErrorItem = function (fileItem, response, status, headers) {
            log.debug('onErrorItem', fileItem, response, status, headers);
          };
          uploader.onCancelItem = function (fileItem, response, status, headers) {
            log.debug('onCancelItem', fileItem, response, status, headers);
          };
          uploader.onCompleteItem = function (fileItem, response, status, headers) {
            log.debug('onCompleteItem', fileItem, response, status, headers);
          };
          uploader.onCompleteAll = function () {
            log.debug('onCompleteAll');
            uploader.clearQueue();
          };

          log.debug('uploader', uploader);
          $scope.artifactTemplate = $templateCache.get('fileUpload.html');
          Core.$apply($scope);
        }

        $scope.$watch("branch", updateURL);
        $scope.$watch("path", updateURL);
      }]
    };
  }]);

}
