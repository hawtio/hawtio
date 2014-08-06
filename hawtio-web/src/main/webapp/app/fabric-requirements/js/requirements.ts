/// <reference path="../../fabric/js/jolokiaHelpers.ts"/>
/// <reference path="fabricRequirementsPlugin.ts"/>
/// <reference path="../../helpers/js/urlHelpers.ts"/>
/// <reference path="../../helpers/js/fileUploadHelpers.ts"/>
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
      var uploadUrl = jolokiaUrl;

      $scope.uploader = <FileUpload.FileUploader> new FileUploader(<FileUpload.IOptions>{
        autoUpload: true,
        removeAfterUpload: true,
        url: uploadUrl
      });

      FileUpload.useJolokiaTransport($scope.uploader, jolokia, (json) => {
        return {
          'type': 'exec',
          mbean: Fabric.managerMBean,
          operation: 'requirementsJson',
          arguments: [json]
        };
      });

      $scope.uploader.onBeforeUploadItem = (item) => {
        Core.notification('info', 'Uploading ' + item);
      };

      $scope.uploader.onSuccessItem = (item:FileUpload.IFileItem) => {
        $scope.requirements = angular.fromJson(item.json);
      };

      $scope.uploader.onCompleteAll = () => {
        Core.notification('success', 'Imported requirements');
      };

      Core.registerForChanges(jolokia, $scope, {
        type: 'exec',
        mbean: Fabric.managerMBean,
        operation: "requirements()"
      }, (response) => {
        log.debug("Got updated requirements object: ", response.value);
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
