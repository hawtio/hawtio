/// <reference path="../../fabric/js/jolokiaHelpers.ts"/>
/// <reference path="fabricRequirementsPlugin.ts"/>
/// <reference path="../../helpers/js/urlHelpers.ts"/>
/// <reference path="../../helpers/js/fileUploadHelpers.ts"/>
module FabricRequirements {

  export interface CurrentRequirements extends Fabric.FabricRequirements {
    $dirty?: boolean;
  }

  // a service that holds the current requirements that the user is working
  // on, allows us to change between views without losing the user's current
  // changes
  _module.service("CurrentRequirements", () => {
    return <CurrentRequirements>{
      $dirty: false
    };
  });

  export var RequirementsController = controller("RequirementsController", ["$scope", "jolokia", "ProfileCart", "$templateCache", "FileUploader", "userDetails", "jolokiaUrl", "$location", "$timeout", "CurrentRequirements", ($scope, jolokia, ProfileCart:Array<Fabric.Profile>, $templateCache, FileUploader, userDetails, jolokiaUrl, $location, $timeout, CurrentRequirements:FabricRequirements.CurrentRequirements) => {

    $scope.tabs = {
      '0': {
        name: 'Profile Requirements',
        href: () => FabricRequirements.requirementsHash + '/profile',
        isActive: () => UrlHelpers.contextActive($location.path(), 'profile')

      },
      '1': {
        name: 'SSH Configuration',
        href: () => FabricRequirements.requirementsHash + '/sshConfig',
        isActive: () => UrlHelpers.contextActive($location.path(), 'sshConfig')
      },
      '2': {
        name: 'Docker Configuration',
        href: () => FabricRequirements.requirementsHash + '/dockerConfig',
        isActive: () => UrlHelpers.contextActive($location.path(), 'dockerConfig')
      },
      '3': {
        name: 'Status',
        href: () => FabricRequirements.requirementsHash + '/status',
        isActive: () => UrlHelpers.contextActive($location.path(), 'status')
      }
    };

    $scope.requirements = CurrentRequirements;
    $scope.template = '';

    $scope.cancelChanges = () => {
      if ($scope.requirements.$dirty) {
        log.debug("Cancelling changes");
        $timeout(() => {
          Object.merge($scope.requirements, $scope.requirementsFromServer, true);
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
        //log.debug("Got updated requirements object: ", response.value);
        //log.debug("Profile cart: ", ProfileCart);
        $scope.requirementsFromServer = <Fabric.FabricRequirements>response.value;
        if (!$scope.requirements.$dirty) {
          Object.merge($scope.requirements, $scope.requirementsFromServer, true);
        }
        var profileRequirements:Array<Fabric.ProfileRequirement> = $scope.requirements.profileRequirements;
        ProfileCart.forEach((profile:Fabric.Profile) => {
          var id = profile.id;
          if (!profileRequirements.some((r) => { return r.profile === id; })) {
            profileRequirements.push({
              profile: id,
              minimumInstances:<number>null,
              maximumInstances:<number>null,
              dependentProfiles:[]
            });
            if (!$scope.requirements.$dirty) {
              $scope.requirements.$dirty = true;
            }
          }
        });
        // now we've pulled 'em in we can clear the profile cart
        ProfileCart.length = 0;

        if (Core.isBlank($scope.template)) {
          $scope.template = $templateCache.get('pageTemplate.html');
        }
        Core.$apply($scope);
      });
    });

  }]);



} 
