/// <reference path="../../fabric/js/jolokiaHelpers.ts"/>
/// <reference path="fabricRequirementsPlugin.ts"/>
/// <reference path="../../helpers/js/urlHelpers.ts"/>
module FabricRequirements {

  export var RequirementsController = controller("RequirementsController", ["$scope", "jolokia", "ProfileCart", "$templateCache", "FileUploader", "userDetails", "jolokiaUrl", "$location", "$timeout", ($scope, jolokia, ProfileCart, $templateCache, FileUploader, userDetails, jolokiaUrl, $location, $timeout) => {

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

    $scope.cancelChanges = () => {
      if ($scope.requirements.$dirty) {
        log.debug("Cancelling changes");
        $timeout(() => {
          $scope.requirements = <Fabric.FabricRequirements>Object.extended($scope.requirementsFromServer).clone();
        }, 20);
      }
    };


    $scope.saveChanges = () => {
      if ($scope.requirements.$dirty) {
        function onRequirementsSaved() {
          Core.notification("success", "Saved the requirements");
          Core.$apply($scope);
        }

        var json = angular.toJson($scope.requirements);
        log.debug("Saving requirementS: ", json);
        $scope.requirements.$dirty = false;
        jolokia.execute(Fabric.managerMBean, "requirementsJson",
                json, onSuccess(onRequirementsSaved));
      }
    };

    // used by child scopes when they change the requirements object
    $scope.onChange = () => {
      $scope.requirements.$dirty = true;
    };

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
        $scope.requirementsFromServer = <Fabric.FabricRequirements>response.value;
        $scope.requirements = <Fabric.FabricRequirements>Object.extended($scope.requirementsFromServer).clone();
        if (Core.isBlank($scope.template)) {
          $scope.template = $templateCache.get('pageTemplate.html');
        }
        Core.$apply($scope);
      });
    });

  }]);



} 
