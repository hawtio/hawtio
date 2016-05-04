/// <reference path="../../helpers/js/objectHelpers.ts"/>
/// <reference path="../../fabric/js/jolokiaHelpers.ts"/>
/// <reference path="fabricRequirementsPlugin.ts"/>
/// <reference path="../../helpers/js/urlHelpers.ts"/>
/// <reference path="../../helpers/js/fileUploadHelpers.ts"/>
module FabricRequirements {

  export interface CurrentRequirements extends Fabric.FabricRequirements {
    $tags?: Array<string>;
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

  export var RequirementsController = controller("RequirementsController", ["$scope", "jolokia", "workspace", "ProfileCart", "$templateCache", "FileUploader", "userDetails", "jolokiaUrl", "$location", "$timeout", "CurrentRequirements", "$element", ($scope, jolokia, workspace: Workspace, ProfileCart:Array<Fabric.Profile>, $templateCache, FileUploader, userDetails, jolokiaUrl, $location, $timeout, CurrentRequirements:FabricRequirements.CurrentRequirements, $element:ng.IAugmentedJQuery) => {

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
    $scope.newTag = '';

    $scope.addTag = (tag:string) => {
      if (tag && !$scope.requirements.$tags.some((t) => { return t === tag; })) {
        $scope.requirements.$tags.push(tag);
        $scope.newTag = '';
        $element.find('#inputNewTag').val('');
      }
    };

    $scope.cancelChanges = () => {
      if ($scope.requirements.$dirty) {
        log.debug("Cancelling changes");
        $timeout(() => {
          Object.merge($scope.requirements, $scope.requirementsFromServer, true);
        }, 20);
        $scope.requirements.$dirty = false;
      }
    };

    $scope.onDrop = (data, model, property) => {
      log.debug("On drop - data: ", data, " model: ", model, " property: ", property);
      if (!model[property]) {
        model[property] = [];
      }
      if (!model[property].any(data)) {
        model[property].push(data);
        $scope.requirements.$dirty = true;
      }
    };

    $scope.$on('hawtio-drop', ($event, data) => {
      $scope.onDrop(data.data, data.model, data.property);
    });

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

    Fabric.loadRestApi(jolokia, workspace, undefined, (response) => {
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

      function createTagList(requirements:CurrentRequirements) {
        var tags = [];
        ['sshConfiguration', 'dockerConfiguration'].forEach((config) => {
          if (requirements[config] && requirements[config].hosts) {
            requirements.sshConfiguration.hosts.forEach((host:Fabric.SshHostConfiguration) => {
              tags.add(host.tags);
            });
          }
        });
        requirements.profileRequirements.forEach((p:Fabric.ProfileRequirement) => {
          ['sshScalingRequirements', 'dockerScalingRequirements'].forEach((req) => {
            if (p[req] && p[req].hostTags) {
              tags.add(p[req].hostTags);
            }
          });
        });
        requirements.$tags = tags.unique().sort();
        //log.debug("Tags: ", profileRequirements.$tags);
      }

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
        createTagList($scope.requirements);
        Core.$apply($scope);
      });
    });

  }]);



} 
