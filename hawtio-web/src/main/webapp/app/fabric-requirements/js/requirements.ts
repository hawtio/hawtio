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
      var uploadUrl = jolokiaUrl;

      $scope.uploader = new FileUploader({
        autoUpload: true,
        removeAfterUpload: true,
        url: uploadUrl
      });

      // extend the uploader with a new transport that can post a
      // jolokia request
      $scope.uploader._xhrTransport = (item) => {
        var reader = new FileReader();
        reader.onload = () => {
          // should be FileReader.DONE
          if (reader.readyState === 2) {
            var json = reader.result;
            jolokia.request({
              'type': 'exec',
              mbean: Fabric.managerMBean,
              operation: 'requirementsJson',
              arguments: [json]
            }, onSuccess((response) => {
              $scope.requirements = angular.fromJson(json);
              $scope.uploader._onSuccessItem(item, response, response.status, {});
              $scope.uploader._onCompleteItem(item, response, response.status, {});
            }, {
              error: (response) => {
                $scope.uploader._onErrorItem(item, response, response.status, {});
                $scope.uploader._onCompleteItem(item, response, response.status, {});
              }
            }));
          }
        };
        reader.readAsText(item._file);
      };

      $scope.uploader.onBeforeUploadItem = (item) => {
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
