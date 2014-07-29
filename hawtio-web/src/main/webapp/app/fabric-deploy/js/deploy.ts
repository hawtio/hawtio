/// <reference path="fabricDeployPlugin.ts"/>
module FabricDeploy {
  export var DeployController = _module.controller("FabricDeploy.DeployController", ["$scope", "FileUploader", "jolokiaUrl", "$templateCache", "jolokia", "userDetails", ($scope, FileUploader:any, jolokiaUrl, $templateCache, jolokia, userDetails:Core.UserDetails) => {

    $scope.artifactTemplate = '';

    var formValues = $scope.entity = {
      profileId: '',
      version: { id: '' } 
    };

    $scope.formConfig = {
      properties: {
        'version': {
          'label': 'Version',
          'type': 'string',
          'formTemplate': '<div fabric-version-selector="entity.version"></div>'
        },
        'profileId': {
          'label': 'Profile Name',
          'type': 'string'
        }
      }
    }

    $scope.$watch('entity', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        log.debug("formValues: ", newValue);
      }
    }, true);

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

      log.debug("Response: ", response);
      log.info("Jolokia URL: ", jolokiaUrl);
      if (jolokiaUrl.startsWith('/hawtio/proxy')) {
        uploadURI = '/hawtio/proxy/' + uploadURI;
      }

      log.debug("Maven upload URI: ", uploadURI);

      var uploader = $scope.artifactUploader = new FileUploader({
        headers: {
          'Authorization': Core.authHeaderValue(userDetails)
        },
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
        item.url = addFileName(uploadURI, item.file.name) + '?profile=' + formValues.profileId + '&version=' + formValues.version.id;
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
      };

      console.info('uploader', uploader);
      $scope.artifactTemplate = $templateCache.get('fileUpload.html');
      Core.$apply($scope);

    }));
  }]);
}
