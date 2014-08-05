/// <reference path="../../fabric/js/jolokiaHelpers.ts"/>
/// <reference path="fabricRequirementsPlugin.ts"/>
/// <reference path="../../helpers/js/urlHelpers.ts"/>
module FabricRequirements {

  export var RequirementsController = controller("RequirementsController", ["$scope", "jolokia", "ProfileCart", "$templateCache", "FileUploader", "userDetails", "jolokiaUrl", "$location", ($scope, jolokia, ProfileCart, $templateCache, FileUploader, userDetails, jolokiaUrl, $location) => {

    $scope.tabs = {
      '0': {
        name: 'Profile Requirements',
        href: () => FabricRequirements.requirementsHash + '/profile',
        isActive: () => UrlHelpers.contextActive($location.url(), 'profile')

      },
      '1': {
        name: 'SSH Configuration',
        href: () => FabricRequirements.requirementsHash + '/sshConfig',
        isActive: () => UrlHelpers.contextActive($location.url(), 'sshConfig')
      },
      '2': {
        name: 'Docker Configuration',
        href: () => FabricRequirements.requirementsHash + '/dockerConfig',
        isActive: () => UrlHelpers.contextActive($location.url(), 'dockerConfig')
      }
    };

    $scope.requirements = <Fabric.FabricRequirements> null;
    $scope.template = '';

    Fabric.loadRestApi(jolokia, undefined, (response) => {
      var restApiUrl = response.value || Fabric.DEFAULT_REST_API;
      var uploadUrl = UrlHelpers.join(restApiUrl, 'requirements');
      log.debug("Upload URL: ", uploadUrl);
      uploadUrl = UrlHelpers.maybeProxy(jolokiaUrl, uploadUrl);

      $scope.uploader = new FileUploader({
        headers: {
          'Authorization': Core.authHeaderValue(userDetails)
        },
        autoUpload: true,
        withCredentials: true,
        method: 'POST',
        url: uploadUrl
      });

      $scope.uploader.onBeforeUploadItem = (item) => {
        item.alias = 'requirements';
        Core.notification('info', 'Uploading ' + item);
      };

      $scope.uploader.onCompleteAll = () => {
        Core.notification('success', 'Imported requirements');
      };

      Core.registerForChanges(jolokia, $scope, {
        type: 'exec',
        mbean: Fabric.managerMBean,
        operation: "requirements()"
      }, (response) => {
        $scope.requirements = <Fabric.FabricRequirements>response.value;
        if (Core.isBlank($scope.template)) {
          $scope.template = $templateCache.get('pageTemplate.html');
        }
        Core.$apply($scope);
      });
    });

  }]);



} 
