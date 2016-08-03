/// <reference path="fabricPlugin.ts"/>
/// <reference path="../../helpers/js/selectionHelpers.ts"/>
module Fabric {

  export var CreateContainerController = _module.controller("Fabric.CreateContainerController", ["$scope", "$element", "$compile", "$location", "workspace", "jolokia", "localStorage", "userDetails", "ProfileCart", ($scope, $element, $compile, $location, workspace, jolokia, localStorage, userDetails:Core.UserDetails, ProfileCart:Profile[]) => {

    var log:Logging.Logger = Logger.get("Fabric");

    $scope.versionsOp = 'versions()';

    $scope.entity = {
      // default options
      number: 1,
      saveJmxCredentials: true
    };


    // the form properties stored in local storage
    // which we then default when creating a new container
    var localStorageProperties = {
      child: {

      },
      openshift: {
        serverUrl: 'openshift.serverUrl',
        domain: 'openshift.domain',
        gearProfile: 'openshift.gearProfile'
      },
      jclouds: {
        owner: 'jclouds.owner',
        credential: 'jclouds.credential',
        providerName: 'jclouds.providerName',
        imageId: 'jclouds.imageId',
        hardwareId: 'jclouds.hardwareId',
        locationId: 'jclouds.locationId',
        group: 'jclouds.group',
        instanceType: 'jclouds.instanceType'
      }
    };

    $scope.providers = Fabric.registeredProviders(jolokia);
    //console.log("providers: ", $scope.providers);
    $scope.selectedProvider = $scope.providers[<any>Object.extended($scope.providers).keys().first()];
    $scope.resolvers = [];
    $scope.schema = {};

    $scope.response = {};

    $scope.versions = [];
    $scope.profiles = [];

    $scope.selectedVersion = {};

    $scope.selectedProfiles = [];
    $scope.selectedProfileIds = '';
    $scope.selectedVersionId = '';
    $scope.profileIdFilter = '';

    $scope.hideProfileSelector = false;
    $scope.returnTo = '/fabric/containerView?groupBy=none';
    $scope.nextPage = '/fabric/containerView?groupBy=none';

    Core.bindModelToSearchParam($scope, $location, 'hideProfileSelector', 'hideProfileSelector', $scope.hideProfileSelector, Core.parseBooleanValue);
    Core.bindModelToSearchParam($scope, $location, 'returnTo', 'returnTo', $scope.returnTo);
    Core.bindModelToSearchParam($scope, $location, 'nextPage', 'nextPage', $scope.nextPage);

    // referenced static data for child
    $scope.child = {
      rootContainers: []
    };

    // referenced static data for all providers
    $scope.allContainers = []

    // referenced static data for openshift
    $scope.openShift = {
      loginDataKey: "openshift.loginData",
      params: null,
      domains: [],
      gearProfiles: [],
      tryLogin: "",
      login: () => {
        var entity = $scope.entity;
        var serverUrl = Core.pathGet(entity, ["serverUrl"]) || "openshift.redhat.com";
        var login = Core.pathGet(entity, ["login"]);
        var password = Core.pathGet(entity, ["password"]);

        log.debug("Invoking login to server " + serverUrl + " user " + login);
        $scope.openShift.loginFailed = false;
        if (serverUrl && login && password) {
          $scope.openShift.domains = [];
          Fabric.getOpenShiftDomains(workspace, jolokia, serverUrl, login, password, (results) => {
            $scope.openShift.domains = results;
            log.debug("found openshift domains: " + results);
            // lets default the value if there's only 1
            if (results.length === 1) {
              $scope.entity.domain = results[0];
            }
            Core.$apply($scope);

            Fabric.getOpenShiftGearProfiles(workspace, jolokia, serverUrl, login, password, (results) => {
              $scope.openShift.gearProfiles = results;
              log.debug("found openshift gears: " + $scope.openShift.gearProfiles);

              // save these in-memory
              Fabric.OpenShiftCredentials.username = login;
              Fabric.OpenShiftCredentials.password = password;
              // now lets store the current settings so they can be defaulted next time without a login
              savePropertiesInLocalStorage();
              var loginData = {
                domains: $scope.openShift.domains,
                gearProfiles: $scope.openShift.gearProfiles
              };
              localStorage[$scope.openShift.loginDataKey] = angular.toJson(loginData);
              Core.$apply($scope);
            });
          }, (error) => {
            $scope.openShift.loginFailed = true;
            Core.$apply($scope);
          });
        }
      }
    };

    // referenced static data for jclouds
    $scope.jclouds = {
    };

    // holds all the form objects from nested child scopes
    $scope.forms = {};

    $scope.showAddProfileDialog = false;

    $scope.$watch('selectedProvider', (newValue, oldValue) => {
      if ($scope.selectedProvider) {
        Fabric.getSchema($scope.selectedProvider.id, $scope.selectedProvider.className, jolokia, (schema) => {
          $scope.schema = schema;
          $scope.resolvers = Fabric.getResolvers($scope.selectedProvider.id);
          Core.$apply($scope);
        });
      }
    }, true
    );

    $scope.$watch('schema', (newValue, oldValue) => {
      if (newValue !== oldValue) {

        $scope.entity['providerType'] = $scope.selectedProvider.id;
        $location.search('tab', $scope.selectedProvider.id);

        var providerId = $scope.entity['providerType'];
        var properties = localStorageProperties[providerId];

        // e.g. key = jmxUser, value = fabric.userName
        //
        //    $scope.entity['jmxUser'] = localStorage['fabric.userName'];
        //    $scope.entity['jmxPassword'] = localStorage['fabric.password'];

        angular.forEach(properties, (value, key) => {
          var localValue = localStorage[value];
          if (localValue) {
            $scope.entity[key] = localValue;
            log.debug("Defaulted entity " + key + " to " + localValue + " from localStorage");
          }
        });

        if (providerId === "openshift") {
          Core.pathSet($scope.entity, ['login'], Fabric.OpenShiftCredentials.username);
          Core.pathSet($scope.entity, ['password'], Fabric.OpenShiftCredentials.password);
          var loginDataText = localStorage[$scope.openShift.loginDataKey];
          if (loginDataText) {
            log.debug("Loaded openshift login details: " + loginDataText);
            var loginData = Wiki.parseJson(loginDataText);
            if (loginData) {
              angular.forEach(["domains", "gearProfiles"], (key) => {
                var value = loginData[key];
                // assume all non-empty arrays for n ow
                if (value && angular.isArray(value) && value.length) {
                  $scope.openShift[key] = value;
                }
              })
            }
          }
        }

        Forms.defaultValues($scope.entity, $scope.schema);

        // load all container ids
        $scope.allContainers = Fabric.getContainerIds(jolokia);

        if ($scope.selectedProvider.id === 'child') {
          // load the root containers and default the parent if its not set
          var rootContainers = Fabric.getRootContainers(jolokia);
          $scope.child.rootContainers = rootContainers;
          if (rootContainers && rootContainers.length === 1 && !$scope.entity["parent"]) {
            $scope.entity["parent"] = rootContainers[0];
          }
          // Use the current user's credentials
          Core.pathSet($scope.entity, ['jmxUser'], userDetails.username);
          Core.pathSet($scope.entity, ['jmxPassword'], userDetails.password);
        } else {
          if ('parent' in $scope.entity) {
            delete $scope.entity["parent"];
          }
        }

        // updates autofilled fields
        window.setTimeout(function () {
          $('input[ng-model]').trigger('input');
        }, 100);
      }
    }, true);


    $scope.$watch('versions', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        if (!$scope.selectedVersion) {
          if ($scope.selectedVersionId !== '') {
            $scope.selectedVersion = $scope.versions.find((v) => { return v.id === $scope.selectedVersionId });
          } else {
            $scope.selectedVersion = $scope.versions.find((v) => {return v.defaultVersion });
          }
        }
      }
    });


    $scope.$watch('selectedVersionId', (newValue, oldValue) => {
      if (oldValue !== newValue) {
        if (newValue && 'id' in newValue) {
          $scope.selectedVersionId = newValue['id'];
          $location.search('versionId', $scope.selectedVersionId);
        }
      }
    }, true);


    $scope.deselect = (profile) => {
      profile.selected = false;
      $scope.selectedProfiles.remove((p) => { return p.id === profile.id; });
    };


    $scope.$watch('selectedProfiles', (newValue, oldValue) => {
      if (oldValue !== newValue) {
        log.debug("selectedProfiles: ", $scope.selectedProfiles);
        if ($scope.selectedProfiles.length > 0) {
          $scope.selectedProfileIds = $scope.selectedProfiles.map((p) => { return p.id; }).join(',');
        } else {
          $scope.selectedProfileIds = "";
        }
        log.debug("selectedProfileIds: ", $scope.selectedProfileIds);
      }
    }, true);


    $scope.$watch('selectedProfileIds', (newValue, oldValue) => {
      if (Core.isBlank($scope.selectedProfileIds)) {
        $scope.selectedProfiles.length = 0;
        //return;
        $location.search('profileIds', null);
      } else {
        var profileIds = $scope.selectedProfileIds.split(',');
        var selected = [];
        profileIds.each((id) => {
          selected.push({
            id: id,
            selected: true
          });
        });
        $scope.selectedProfiles = selected;
        $location.search('profileIds', $scope.selectedProfileIds);
      }
    });

    $scope.massage = (str) => {
      if (str === 'name') {
        return 'containerName';
      }
      return str;
    };


    $scope.rootContainers = () => {
      return Fabric.getRootContainers(jolokia);
    };

    $scope.init = () => {

      var tab = $location.search()['tab'];
      if (tab) {
        $scope.selectedProvider = $scope.providers[tab];
      }

      var parentId = $location.search()['parentId'];
      if (parentId) {
        $scope.entity['parent'] = parentId;
      }

      var versionId = $location.search()['versionId'];
      if (versionId) {
        $scope.selectedVersion = {
          id: versionId
        };
      } else if (ProfileCart.length > 0) {
        $scope.selectedVersion = {
          id: (<Profile>ProfileCart.first()).versionId
        }
      }

      var profileIds = $location.search()['profileIds'];
      if (profileIds) {
        $scope.selectedProfileIds = profileIds;
      } else if (ProfileCart.length > 0) {
        $scope.selectedProfileIds = ProfileCart.map((p:Profile) => { return p.id; }).join(',');
      }

      var count = $location.search()['number'];
      if (count) {
        $scope.entity.number = count;
      }

    };

    $scope.init();


    $scope.$on('$routeUpdate', $scope.init);


    /**
     * Saves the provider specific properties into localStorage; called on a succesful submit
     * or on a Login in the form so we remember the last successful login attempt.
     */
    function savePropertiesInLocalStorage() {
      var providerId = $scope.entity['providerType'];
      var properties = localStorageProperties[providerId];

      angular.forEach(properties, (value, key) => {
        var entityValue = $scope.entity[key];
        if (entityValue) {
          localStorage[value] = entityValue;
        }
      });
    }

    $scope.goBack = () => {
      var target = new URI($scope.returnTo);
      $location.path(target.path()).search(target.search(true));
    };

    $scope.goForward = () => {
      var target = new URI($scope.nextPage);
      $location.path(target.path()).search(target.search(true));
    };

    $scope.onSubmit = (json, form) => {
      var providerId = $scope.entity['providerType'];
      // remove possibly dodgy values if they are blank
      json = Fabric.sanitizeJson(json);

      if ( json.number === 1 ) {
        delete json.number;
      }

      var selectedVersion = $scope.selectedVersion;
      if (selectedVersion) {
        json['version'] = selectedVersion.id;
      }
      if ($scope.selectedProfiles.length > 0) {
        json['profiles'] = $scope.selectedProfiles.map((p) => { return p.id; });
      }

      var createJson = angular.toJson(json);

      log.debug("createContainers json:\n" + createJson);

      setTimeout(() => {
        jolokia.execute(managerMBean, 'createContainers(java.util.Map)', createJson, {
          method: "post",
          success: (response) => {
            log.debug("Response from creating container(s): ", response);
            var error = false;
            if ('<not available>' in response) {
              var message = response['<not available>'];
              if (message.toLowerCase().has('exception')) {
                error = true;
                var cont = "container";
                if (json.number) {
                  cont = Core.maybePlural(json.number, "container");
                }
                Core.notification('error', "Creating " + cont  + " failed: " + message);
              }
            }

            // check for error if a container already exists with that name
            var text = response[json.name];
            if (text && text.toLowerCase().has('already exists')) {
              error = true;
              Core.notification('error', "Creating container " + json.name + " failed as a container with that name already exists.");
            }

            angular.forEach(response.value, function(value, key) {
              error = true;
              Core.notification('error', "Creating container " + key + " failed: " + value);
            });
            if (!error) {
              SelectionHelpers.clearGroup(ProfileCart);
              // If the parent container had a location, set the location on the new container(s)
              var parentLocation = Fabric.getContainerFields(jolokia, json.parent, ['location']).location;
              if (!Core.isBlank(parentLocation) && parentLocation !== ContainerHelpers.NO_LOCATION) {
                var newContainerIds = [];
                if (json.number) {  // json.number is the number of containers requested
                  for (var i = 1; i <= json.number; i++) {
                    newContainerIds.push(json.name + i)
                  }
                } else {
                  newContainerIds = [json.name];
                }
                var updatedContainers = Fabric.getContainerIds(jolokia);
                angular.forEach(updatedContainers, (containerId) => {
                  var idx = newContainerIds.indexOf(containerId);
                  if (idx >= 0) {
                      setContainerProperty(jolokia, containerId, 'location', parentLocation, () => {
                      Core.$apply($scope);
                    }, (response) => {
                      Core.notification('error', 'Failed to set container loction due to : ' + response.error);
                      Core.$apply($scope);
                    });

                  }
                });
              }
              Core.notification('success', "Successfully created containers");
            }
            Core.$apply($scope);
          },
          error: (response) => {
            Core.notification('error', "Error creating containers: " + response.error);
            Core.$apply($scope);
          }
        });
        Core.$apply($scope);
      }, 10);

      //notification('info', "Requesting that new container(s) be created");
      $scope.goForward();
    }
  }]);
}
