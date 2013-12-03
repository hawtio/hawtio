/**
 * @module Fabric
 */
module Fabric {

  export var log:Logging.Logger = Logger.get("Fabric");
  
  export var jmxDomain = "org.fusesource.fabric";
  
  export var managerMBean = Fabric.jmxDomain + ":type=Fabric";
  export var clusterManagerMBean = Fabric.jmxDomain + ":type=ClusterServiceManager";
  export var clusterBootstrapManagerMBean = Fabric.jmxDomain + ":type=ClusterBootstrapManager";
  export var openShiftFabricMBean = Fabric.jmxDomain + ":type=OpenShift";
  export var mqManagerMBean = Fabric.jmxDomain + ":type=MQManager";

  var schemaLookupDomain = "io.hawt.jsonschema";
  var schemaLookupType = "SchemaLookup";

  export var schemaLookupMBean = schemaLookupDomain + ":type=" + schemaLookupType;

  export var useDirectoriesInGit = true;
  var fabricTopLevel = "fabric/profiles/";
  export var profileSuffix = ".profile";

  //export var jolokiaWebAppGroupId = "org.jolokia";
  export var jolokiaWebAppGroupId = "org.fusesource.fabric.fabric-jolokia";

  export function fabricCreated(workspace) {
    return workspace.treeContainsDomainAndProperties(Fabric.jmxDomain, {type: "Fabric"});
  }

  export function canBootstrapFabric(workspace) {
    return workspace.treeContainsDomainAndProperties(Fabric.jmxDomain, {type: "ClusterBootstrapManager"});
  }

  export function hasOpenShiftFabric(workspace) {
    return workspace.treeContainsDomainAndProperties(Fabric.jmxDomain, {type: "OpenShift"});
  }

  export function hasMQManager(workspace) {
    return workspace.treeContainsDomainAndProperties(Fabric.jmxDomain, {type: "MQManager"});
  }

  export function hasSchemaMBean(workspace) {
    return workspace.treeContainsDomainAndProperties(schemaLookupDomain, {type: schemaLookupType});
  }

  export function hasGitMBean(workspace) {
    return workspace.treeContainsDomainAndProperties(Git.jmxDomain, {type: Git.mbeanType});
  }

  export function isFMCContainer(workspace) {
    return Fabric.hasFabric(workspace) &&
           Fabric.hasSchemaMBean(workspace) &&
           Fabric.hasGitMBean(workspace);
  }

  export function hasFabric(workspace):boolean{
    // lets make sure we only have a fabric if we have the ClusterBootstrapManager available
    // so that we hide Fabric for 6.0 or earlier of JBoss Fuse which doesn't have the necessary
    // mbeans for hawtio awesomeness
    return fabricCreated(workspace) && canBootstrapFabric(workspace);
  }

  /**
   * Adds a bunch of common helper functions to the given scope
   * @method initScope
   * @for Fabric
   * @param {any} $scope
   * @param {ng.ILocationService} $location
   * @paran {*} jolokia
   * @param {Workspace} workspace
   */
  export function initScope($scope, $location, jolokia, workspace) {

    $scope.isCurrentContainer = (container) => {
      if (!container) {
        return false;
      }
      if (Core.isBlank(Fabric.currentContainerId)) {
        return false;
      }
      if (angular.isObject(container)) {
        return container['id'] === Fabric.currentContainerId;
      }
      if (angular.isString(container)) {
        return container === Fabric.currentContainerId;
      }

      return false;
    };

    $scope.canConnect = (container) => {
      if (!container) {
        return false;
      }
      if (Core.isBlank(container['jolokiaUrl'])) {
        return false;
      }

      if (!Core.parseBooleanValue(container['alive'])) {
        return false;
      }
      return !$scope.isCurrentContainer(container);
    };

    $scope.hasFabricWiki = () => {
      return Git.isGitMBeanFabric(workspace);
    };

    $scope.showContainer = (container) => {
      $location.path('/fabric/container/' + container.id);
    };

    $scope.createRequiredContainers = (profile) => {
      var profileId = profile.id;
      var args = {};
      if (profileId) {
        args["profileIds"] = profileId;
      }
      var versionId = profile.versionId || profile.version;
      if (versionId) {
        args["versionId"] = versionId;
      }
      var requirements = profile.requirements;
      if (requirements) {
        var min = requirements.minimumInstances;
        if (min) {
          var delta = min - (profile.count || 0);
          if (delta > 1) {
            args["number"] = delta;
          }
        }
      }
      $location.url('/fabric/containers/createContainer').search(args);
    };

    $scope.createContainer = () => {
      var kind = null;
      // lets see if there is an openshift option
      var providers = registeredProviders(jolokia);
      angular.forEach(["openshift", "jclouds"], (value) => {
        if (!kind && providers[value]) {
          kind = value;
        }
      });
      if (!kind) {
        kind = 'child';
      }
      $location.url('/fabric/containers/createContainer').search('tab', kind);
    };

    $scope.createChildContainer = (container) => {
      $location.url('/fabric/containers/createContainer').search({ 'tab': 'child', 'parentId': container.id });
    };


    $scope.createChildContainer = (container) => {
      $location.url('/fabric/containers/createContainer').search({ 'tab': 'child', 'parentId': container.id });
    };

    $scope.showProfile = (profile) => {
      var version = profile.versionId || profile.version || $scope.activeVersionId;
      Fabric.gotoProfile(workspace, jolokia, localStorage, $location, version, profile);
    };

    $scope.getSelectedClass = (obj) => {
      var answer = [];
      if (obj.selected) {
        answer.push('selected');
      }
      if (angular.isDefined(obj['root']) && obj['root'] === false) {
        answer.push('child-container');
      }
      return answer.join(' ');
    };

    $scope.statusIcon = (row) => {
      return Fabric.statusIcon(row);
    };


    $scope.isEnsembleContainer = (containerId) => {
      if ($scope.ensembleContainerIds) {
        return $scope.ensembleContainerIds.any(containerId);
      }
      return false;
    };


    // for connection dialog
    $scope.connect = {
      dialog: new Core.Dialog(),
      saveCredentials: false,
      userName: null,
      password: null,
      container: null,
      view: null,

      onOK: () => {
        var userName = $scope.connect.userName;
        var password = $scope.connect.password;
        var container = $scope.connect.container;
        log.info("Logging into container " + container + " with user " + userName);

        if ($scope.connect.saveCredentials) {
          $scope.connect.saveCredentials = false;
          if (userName) {
            localStorage['fabric.userName'] = userName;
          }
          if (password) {
            localStorage['fabric.password'] = password;
          }
        }
        console.log("Connecting as user " + userName);
        var options =  new Core.ConnectToServerOptions();
        options.view = $scope.connect.view;
        Fabric.connect(localStorage, container, userName, password, true, options);
        $scope.connect.container = {};
        setTimeout(() => {
          $scope.connect.dialog.close();
          Core.$apply($scope);
        }, 100);
      }
    };

    $scope.doConnect = (container, view) => {
      // TODO at least obfusicate this
      $scope.connect.userName = Core.username || localStorage['fabric.userName'];
      $scope.connect.password = Core.password || localStorage['fabric.password'];
      $scope.connect.container = container;
      $scope.connect.view = view || "/logs";

      var alwaysPrompt = localStorage['fabricAlwaysPrompt'];
      if ((alwaysPrompt && alwaysPrompt !== "false") || !$scope.connect.userName || !$scope.connect.userName) {
        $scope.connect.dialog.open();
      } else {
        $scope.connect.onOK();
      }
    };

    $scope.changeVersionDialog = {
      show: false,
      containerIds: [],
      versions: [],

      gridOptions: {
        data: 'changeVersionDialogVersions',
        showFilter: false,
        showColumnMenu: false,
        multiSelect: false,
        filterOptions: {
          filterText: "",
          useExternalFilter: false
        },
        selectedItems: [],
        sortInfo: {
          fields: ["id"],
          directions: ["desc"]
        },
        columnDefs: [
          {
            field: 'id',
            displayName: 'Select New Version'
          }
        ]
      },

      open: (containers) => {
        $scope.changeVersionDialog.containers = containers || [];
        $scope.changeVersionDialog.gridOptions.selectedItems = [];

        function render(response) {
          if (response) {
            // if there's only one current version ID, lets filter that one out of the list
            var currentIds = $scope.changeVersionDialog.containers.map(c => c.versionId).unique();
            if (currentIds && currentIds.length === 1) {
              var currentId = currentIds[0];
              response = response.filter(v => {
                log.info("Filtering id '" + v.id + "' against version '" + currentId + "'");
                return v.id !== currentId;
              });
            }
          }
          // select the latest version of the available options
          if (response.length > 0) {
            $scope.changeVersionDialog.gridOptions.selectedItems.push(response[response.length - 1]);
          }
          $scope.changeVersionDialogVersions = response;
          $scope.changeVersionDialog.show = true;
          Core.$apply($scope);
        }

        jolokia.execute(managerMBean, 'versions(java.util.List)',
          ['id', 'defaultVersion'], onSuccess(render));
      },
      close: () => {
        $scope.changeVersionDialog.show = false;
      },
      onOk: () => {
        $scope.changeVersionDialog.close();
        var selectedItems = $scope.changeVersionDialog.gridOptions.selectedItems;
        if (selectedItems && selectedItems.length) {
          var newVersionId = selectedItems[0].id;
          if (newVersionId) {
            var containerIds = $scope.changeVersionDialog.containers.map(c => c.id);
            log.info("Setting version to " + newVersionId + " on containers: " + containerIds);

            Fabric.migrateContainers(jolokia, newVersionId, containerIds, () => {
              notification('success', "Successfully migrated containers");
            }, (response) => {
              notification('error', "Failed to migrate containers due to " + response.error);
            });
          }
        }
      }
    };

  }

  /**
   * Converts the given path from the wiki into a profile ID
   * @method pagePathToProfileId
   * @param {String} pageId
   * @return {String}
   */
  export function pagePathToProfileId(pageId): string {
    var answer = null;
    if (angular.isDefined(pageId) && pageId.has(fabricTopLevel) && pageId !== fabricTopLevel) {
      var profileId = pageId.remove(fabricTopLevel);
      if ((Fabric.useDirectoriesInGit || !profileId.has("/"))) {
        var profileSeparator = profileId.indexOf(profileSuffix + "/");
        var endsWithSuffix = profileId.endsWith(profileSuffix);
        if (!Fabric.useDirectoriesInGit || endsWithSuffix || profileSeparator > 0) {
          if (Fabric.useDirectoriesInGit) {
            if (endsWithSuffix) {
              profileId = Core.trimTrailing(profileId, profileSuffix);
            } else if (profileSeparator > 0) {
              profileId = profileId.substring(0, profileSeparator);
            }
            profileId = profileId.replace(/\//g, "-");
          }
          answer = profileId;
        }
      }
    }
    return answer;
  }

  export function profilePath(profileId) {
    return profileId.replace(/-/g, "/") + profileSuffix;
  }

  export function profileLink(workspace, jolokia, localStorage, versionId, profileId) {
    var path;
    if (Wiki.isWikiEnabled(workspace, jolokia, localStorage)) {
      path = "/wiki/branch/" + versionId + "/view/fabric/profiles/" + Fabric.profilePath(profileId);
    } else {
      path = "/fabric/profile/" + versionId + "/" + profileId;
    }
    return path;
  }

  /**
   * Returns the CSS style for the number of containers badge
   * @method containerCountBadgeStyle
   * @param {Number} min
   * @param {number} count
   * @return {string}
   */
  export function containerCountBadgeStyle(min, count) {
    if (min) {
      if (!count) {
        return "badge-important";
      } else {
        return min <= count ? "badge-success" : "badge-warning";
      }
    }
    return "";
  }

  export function gotoProfile(workspace, jolokia, localStorage, $location, versionId, profile) {
    var path = profileLink(workspace, jolokia, localStorage, versionId, profile.id);
    $location.url(path);
  }

  export function setSelect(selection, group) {
    if (!angular.isDefined(selection)) {
      return group[0];
    }
    var answer = group.findIndex( function(item) { return item.id === selection.id } );
    if (answer !== -1) {
      return group[answer];
    } else {
      return group[0];
    }
  }

  export function doDeleteContainer($scope, jolokia, name, onDelete:() => any = null) {
    notification('info', "Deleting " + name);
    destroyContainer(jolokia, name, () => {
      notification('success', "Deleted " + name);
      if (onDelete) {
        onDelete();
      }
      Core.$apply($scope);
    }, (response) => {
      notification('error', "Failed to delete " + name + " due to " + response.error);
      Core.$apply($scope);
    });
  }

  export function doStartContainer($scope, jolokia, name) {
    notification('info', "Starting " + name);
    startContainer(jolokia, name, () => {
      notification('success', "Started " + name);
      Core.$apply($scope);
    }, (response) => {
      notification('error', "Failed to start " + name + " due to " + response.error);
      Core.$apply($scope);
    });
  }

  export function doStopContainer($scope, jolokia, name) {
    notification('info', "Stopping " + name);
    stopContainer(jolokia, name, () => {
      notification('success', "Stopped " + name);
      Core.$apply($scope);
    }, (response) => {
      notification('error', "Failed to stop " + name + " due to " + response.error);
      Core.$apply($scope);
    });
  }

  export var urlResolvers = ['http:', 'ftp:', 'mvn:'];

  export function completeUri ($q, $scope, workspace, jolokia, something) {


  }

  export function applyPatches(jolokia, files, targetVersion, newVersionName, proxyUser, proxyPass, success, error) {
    doAction('applyPatches(java.util.List,java.lang.String,java.lang.String,java.lang.String,java.lang.String)', jolokia, [files, targetVersion, newVersionName, proxyUser, proxyPass], success, error);
  }

  export function setContainerProperty(jolokia, containerId, property, value, success, error) {
    doAction('setContainerProperty(java.lang.String, java.lang.String, java.lang.Object)', jolokia, [containerId, property, value], success, error);
  }

  export function deleteConfigFile(jolokia, version, profile, pid, success, error) {
    doAction('deleteConfigurationFile(java.lang.String, java.lang.String, java.lang.String)', jolokia, [version, profile, pid], success, error);
  }

  export function newConfigFile(jolokia, version, profile, pid, success, error) {
    doAction('setConfigurationFile(java.lang.String, java.lang.String, java.lang.String, java.lang.String)', jolokia, [version, profile, pid, ''], success, error);
  }

  export function saveConfigFile(jolokia, version, profile, pid, data, success, error) {
    doAction('setConfigurationFile(java.lang.String, java.lang.String, java.lang.String, java.lang.String)', jolokia, [version, profile, pid, data], success, error);
  }

  export function addProfilesToContainer(jolokia, container, profiles, success, error) {
    doAction('addProfilesToContainer(java.lang.String, java.util.List)', jolokia, [container, profiles], success, error);
  }

  export function removeProfilesFromContainer(jolokia, container, profiles, success, error) {
    doAction('removeProfilesFromContainer(java.lang.String, java.util.List)', jolokia, [container, profiles], success, error);
  }

  export function applyProfiles(jolokia, version, profiles, containers, success, error) {
    doAction('applyProfilesToContainers(java.lang.String, java.util.List, java.util.List)', jolokia, [version, profiles, containers], success, error);
  }

  export function migrateContainers(jolokia, version, containers, success, error) {
    doAction('applyVersionToContainers(java.lang.String, java.util.List)', jolokia, [version, containers], success, error);
  }

  export function changeProfileParents(jolokia, version, id, parents, success, error) {
    doAction('changeProfileParents(java.lang.String, java.lang.String, java.util.List)', jolokia, [version, id, parents], success, error);
  }

  export function createProfile(jolokia, version, id, parents, success, error) {
    doAction('createProfile(java.lang.String, java.lang.String, java.util.List)', jolokia, [version, id, parents], success, error);
  }

  export function copyProfile(jolokia, version, sourceName, targetName, force, success, error) {
    doAction('copyProfile(java.lang.String, java.lang.String, java.lang.String, boolean)', jolokia, [version, sourceName, targetName, force], success, error);
  }

  export function createVersionWithParentAndId(jolokia, base, id, success, error) {
    doAction('createVersion(java.lang.String, java.lang.String)', jolokia, [base, id], success, error);
  }

  export function createVersionWithId(jolokia, id, success, error) {
    doAction('createVersion(java.lang.String)', jolokia, [id], success, error);
  }

  export function createVersion(jolokia, success, error) {
    doAction('createVersion()', jolokia, [], success, error);
  }

  export function deleteVersion(jolokia, id, success, error) {
    doAction('deleteVersion(java.lang.String)', jolokia, [id], success, error);
  }

  // TODO cache the current active version? Then clear the cached value if we delete it
  export function activeVersion($location) {
    return $location.search()['cv'] || "1.0";
  }

  export function getContainerIdsForProfile(jolokia, version, profileId) {
    return jolokia.execute(Fabric.managerMBean, "containerIdsForProfile", version, profileId, { method: 'POST' });
  }

  export function deleteProfile(jolokia, version, id, success, error) {
    doAction('deleteProfile(java.lang.String, java.lang.String)', jolokia, [version, id], success, error);
  }

  export function profileWebAppURL(jolokia, webAppId, profileId, versionId, success, error) {
    doAction('profileWebAppURL', jolokia, [webAppId, profileId, versionId], success, error);
  }

  function onJolokiaUrlCreateJolokia(response, fn) {
    var jolokia = null;
    if (response) {
      var url = response.value;
      if (url) {
        // lets use a proxy if the URL is external
        url = Core.useProxyIfExternal(url);
        jolokia = Fabric.createJolokia(url);
      } else {
        if (response.error) {
          log.warn(response.error, response.stacktrace);
        }
      }
      if (fn) {
        fn(jolokia);
      }
    }
    return jolokia;
  }



  /**
   * Attempts to create a jolokia for the given profile and version passing the created object
   * into the onJolokia function
   * @method profileJolokia
   *
   * @paran {*} jolokia
   * @param {String} profileId
   * @param {String} versionId
   * @param {Function} onJolokia a function to receive the jolokia object or null if one cannot be created
   */
  export function profileJolokia(jolokia, profileId, versionId, onJolokia) {
    function onJolokiaUrl(response) {
      return onJolokiaUrlCreateJolokia(response, onJolokia);
    }

    return Fabric.profileWebAppURL(jolokia, jolokiaWebAppGroupId, profileId, versionId, onJolokiaUrl, onJolokiaUrl);
  }

  /**
   * Attempts to create a jolokia for the given container id, passing the created object
   * into the onJolokia function
   * @method containerJolokia
   * @paran {*} jolokia
   * @param {String} containerId the id of the container to connect to
   * @param {Function} onJolokia a function to receive the jolokia object or null if one cannot be created
   */
  export function containerJolokia(jolokia, containerId, onJolokia) {
    function onJolokiaUrl(response) {
      return onJolokiaUrlCreateJolokia(response, onJolokia);
    }
    return Fabric.containerWebAppURL(jolokia, jolokiaWebAppGroupId, containerId, onJolokiaUrl, onJolokiaUrl);
  }

  export function containerWebAppURL(jolokia, webAppId, containerId, success, error) {
    doAction('containerWebAppURL', jolokia, [webAppId, containerId], success, error);
  }

  export function doAction(action, jolokia, arguments, success, error) {
    jolokia.request(
        {
          type: 'exec', mbean: managerMBean,
          operation: action,
          arguments: arguments
        },
        {
          method: 'POST',
          success: success,
          error: error
        });
  }
  
  export function stopContainer(jolokia, id, success, error) {
    doAction('stopContainer(java.lang.String)', jolokia, [id], success, error);
  }

  export function destroyContainer(jolokia, id, success, error) {
    doAction('destroyContainer(java.lang.String)', jolokia, [id], success, error);
  }

  export function startContainer(jolokia, id, success, error) {
    doAction('startContainer(java.lang.String)', jolokia, [id], success, error);
  }
  
  
  export function getServiceList(container) {
    var answer = [];
    if (angular.isDefined(container) && angular.isDefined(container.jmxDomains) && angular.isArray(container.jmxDomains) && container.alive) {

      container.jmxDomains.forEach((domain) => {
        if (domain === "org.fusesource.insight") {
          answer.push({
            title: "Fuse Insight",
            type: "icon",
            src: "icon-eye-open"
          })
        }
        if (domain === "org.apache.activemq") {
          answer.push({
            title: "Apache ActiveMQ",
            type: "img",
            src: "app/fabric/img/message_broker.png"
          });
        }
        if (domain === "org.apache.camel") {
          answer.push({
            title: "Apache Camel",
            type: "img",
            src: "app/fabric/img/camel.png"
          });
        }
        if (domain === "org.fusesource.fabric") {
          answer.push({
            title: "Fuse Fabric",
            type: "img",
            src: "app/fabric/img/fabric.png"
          });
        }
        if (domain === "hawtio") {
          answer.push({
            title: "hawtio",
            type: "img",
            src: "app/fabric/img/hawtio.png"
          });
        }
        if (domain === "org.apache.karaf") {
          answer.push({
            title: "Apache Karaf",
            type: "icon",
            src: "icon-beaker"
          })
        }
        if (domain === "org.apache.zookeeper") {
          answer.push({
            title: "Apache Zookeeper",
            type: "icon",
            src: "icon-group"
          })
        }
      });
    }
    return answer;
  }

  /**
   * Returns the default version ID for the current fabric
   * @param jolokia
   * @returns the version ID as a string; or defaults to 1.0 if not available
   */
  export function getDefaultVersionId(jolokia) {
    return (getDefaultVersion(jolokia) || {})["id"] || "1.0";
  }

  /**
   * Returns the default version object for the current fabric
   * @param jolokia
   * @returns the version object
   */
  export function getDefaultVersion(jolokia) {
    return jolokia.execute(managerMBean, "defaultVersion()");
  }


  /**
   * Default the values that are missing in the returned JSON
   * @method defaultContainerValues
   * @param {Workspace} workspace
   * @param {any} $scope
   * @param {Array} values
   */
  export function defaultContainerValues(workspace:Workspace, $scope, values) {
    var map = {};
    angular.forEach(values, (row) => {
      var profileIds = row["profileIds"];
      if (profileIds) {
        angular.forEach(profileIds, (profileId) => {
          var containers = map[profileId];
          if (!containers) {
            containers = [];
            map[profileId] = containers;
          }
          containers.push(row);
        });
      }
      $scope.profileMap = map;
      row["link"] = containerLinks(workspace, row["id"]);
      row["profileLinks"] = profileLinks(workspace, row["versionId"], profileIds);


      var versionId = row["versionId"];
      var versionHref = url("#/fabric/profiles?v=" + versionId);
      var versionLink =  "<a href='" + versionHref + "'>" + versionId + "</a>"
      row["versionHref"] = versionHref;
      row["versionLink"] = versionLink;

      var id = row['id'] || "";
      var title = "container " + id + " ";
      var img = "red-dot.png";
      if (row['managed'] === false) {
        img = "spacer.gif";
      } else if (!row['alive']) {
        img = "gray-dot.png";
      } else if (row['provisionPending']) {
        img = "pending.gif";
      } else if (row['provisionStatus'] === 'success') {
        img = "green-dot.png";
      }
      img = "img/dots/" + img;
      row["statusImageHref"] = img;
      row["link"] = "<img src='" + img + "' title='" + title + "'/> " + (row["link"] || id);
    });
    return values;
  }

  // TODO move to core?
  export function toCollection(values) {
    var collection = values;
    if (!angular.isArray(values)) {
      collection = [values];
    }
    return collection;
  }

  export function containerLinks(workspace, values) {
    var answer = "";
    angular.forEach(toCollection(values), function (value, key) {
      var prefix = "";
      if (answer.length > 0) {
        prefix = " ";
      }
      answer += prefix + "<a href='" + url("#/fabric/container/" + value + workspace.hash()) + "'>" + value + "</a>";
    });
    return answer;
  }

  export function profileLinks(workspace, versionId, values) {
    var answer = "";
    angular.forEach(toCollection(values), function (value, key) {
      var prefix = "";
      if (answer.length > 0) {
        prefix = " ";
      }
      answer += prefix + "<a href='" + url("#/fabric/profile/" + versionId + "/" + value + workspace.hash()) + "'>" + value + "</a>";
    });
    return answer;
  }

  /**
   * Default the values that are missing in the returned JSON
   * @method defaultProfileValues
   * @param {Workspace} workspace
   * @param {String} versionId
   * @param {Array} values
   */
  export function defaultProfileValues(workspace, versionId, values) {
    angular.forEach(values, (row) => {
      var id = row["id"];
      row["link"] = profileLinks(workspace, versionId, id);
      row["parentLinks"] = profileLinks(workspace, versionId, row["parentIds"]);
      var containersHref = url("#/fabric/containers?p=" + id);
      var containerCount = row["containerCount"];
      var containersLink = "";
      if (containerCount) {
        containersLink = "<a href='" + containersHref + "'>" + containerCount + "</a>"
      }
      row["containersCountLink"] = containersLink;
      row["containersHref"] = containersHref;
    });
    return values;
  }

  export function getZooKeeperFacadeMBean(workspace: Workspace) {
    var folder = workspace.findMBeanWithProperties(jmxDomain, {type: "ZooKeeper"});
    return Core.pathGet(folder, "objectName");
  }

  export function statusTitle(container) {
    var answer = 'Alive';
    if (!container.alive) {
      answer = 'Not Running';
    } else {
      answer += ' - ' + humanizeValue(container.provisionResult);
    }
    return answer;
  }

  export function statusIcon(row) {
    if (row) {
      if (row.alive) {
        switch(row.provisionResult) {
          case 'success':
            return "green icon-play-circle";
          case 'downloading':
            return "icon-download-alt";
          case 'installing':
            return "icon-hdd";
          case 'analyzing':
          case 'finalizing':
            return "icon-refresh icon-spin";
          case 'resolving':
            return "icon-sitemap";
          case 'error':
            return "red icon-warning-sign";
        }
      } else {
        return "orange icon-off";
      }
    }
    return "icon-refresh icon-spin";
  }

  /**
   * Opens a window connecting to the given container row details if the jolokiaUrl is available
   * @method connect
   * @param {any} localStorage
   * @param {any} row
   * @param {String} userName
   * @param {String} password
   * @param {Boolean} useProxy
   * @param {ConnectToServerOptions} options
   */
  export function connect(localStorage, row, userName = "", password = "", useProxy = true, options:Core.ConnectToServerOptions = new Core.ConnectToServerOptions()) {
    options.jolokiaUrl = row.jolokiaUrl;
    options.userName = userName;
    options.password = password;
    options.useProxy = useProxy;

    Core.connectToServer(localStorage, options);

  }

  /**
   * Creates a jolokia object for connecting to the container with the given remote jolokia URL
   * @method createJolokia
   * @param {String} url
   */
  export function createJolokia(url: string) {
    // lets default to the user/pwd for the login
    // TODO maybe allow these to be configured to other values?
    var username = Core.username;
    var password = Core.password;
    if (!username) {
      // lets try reverse engineer the user/pwd from the stored user/pwd
      var jsonText = localStorage[url];
      if (jsonText) {
        var obj = Wiki.parseJson(jsonText);
        if (obj) {
          username = obj["username"];
          password = obj["password"];
        }
      }
    }
    log.info("Logging into remote jolokia " + url + " using username: " + username);
    return Core.createJolokia(url, username, password);
  }

  export function registeredProviders(jolokia) {
    var providers = jolokia.execute(Fabric.managerMBean, 'registeredProviders()');
    var answer = {};
    angular.forEach(providers, (value, key) => {
      answer[key] = {
        id: key,
        className: value
      };
    });
    return answer;
  }

  export function getSchema(id, className, jolokia, cb) {
    jolokia.execute(Fabric.schemaLookupMBean, 'getSchemaForClass(java.lang.String)', className, {
      method: 'POST',
      success: (value) => {
        cb(Fabric.customizeSchema(id, angular.fromJson(value)));
      }
    });
  }

  export function getDtoSchema(id, className, jolokia, cb) {
    jolokia.execute(Fabric.schemaLookupMBean, 'getSchemaForClass(java.lang.String)', className, {
      method: 'POST',
      success: (value) => {
        cb(angular.fromJson(value));
      }
    });
  }


  export function getCurrentContainer(jolokia, fields) {
    var name = jolokia.getAttribute(Fabric.managerMBean, 'CurrentContainerName', { method: 'POST' });
    return jolokia.execute(Fabric.managerMBean, "getContainer(java.lang.String, java.util.List)", name, fields, { method: 'POST' });
  }

  export function getContainerFields(jolokia, name, fields) {
    return jolokia.execute(Fabric.managerMBean, "getContainer(java.lang.String, java.util.List)", name, fields, { method: 'POST' });
  }


  export function getRootContainers(jolokia) {
    var fields = ["id", "root"];
    var answer = jolokia.execute(Fabric.managerMBean, "containers(java.util.List)", fields, { method: 'POST' });
    return answer.filter({root: true}).map(v => v["id"]);
  }

  export function getOpenShiftDomains(workspace ,jolokia, serverUrl, login, password, fn = null, onError = null) {
    if (hasOpenShiftFabric(workspace) && serverUrl && login && password) {
      var options = onSuccess(fn, {error: onError});
      return jolokia.execute(Fabric.openShiftFabricMBean, "getDomains", serverUrl, login, password, options);
    } else {
      if (fn) {
        fn([]);
      }
      return [];
    }
  }

  export function getOpenShiftGearProfiles(workspace ,jolokia, serverUrl, login, password, fn = null) {
    if (hasOpenShiftFabric(workspace) && serverUrl && login && password) {
      return jolokia.execute(Fabric.openShiftFabricMBean, "getGearProfiles", serverUrl, login, password, onSuccess(fn));
    } else {
      if (fn) {
        fn([]);
      }
      return [];
    }
  }


  export function filterProfiles(jolokia, versionId, profileIds) {
    var profiles = jolokia.execute(Fabric.managerMBean, "getProfiles(java.lang.String, java.util.List)", versionId, ['id', 'hidden', 'abstract'], { method: 'POST' });

    profiles = profiles.filter((profile) => {
      return profileIds.some((id) => { return profile.id === id });
    });
    profiles = profiles.filter((profile => {
      return !profile.abstract && !profile.hidden;
    }));

    return profiles.map((p) => { return p.id; });
  }

  export function getProfileData(jolokia, versionId, profileId, fields) {
    return jolokia.execute(Fabric.managerMBean, "getProfile(java.lang.String, java.lang.String, java.util.List)", versionId, profileId, fields, { method: 'POST' });
  }

  export function getConfigFile(jolokia, versionId, profileId, fileName, fn = null) {
    function onResults(answer) {
      return answer ? answer.decodeBase64() : null;
    }

    var callback = !fn ? null :
      (result) => {
        fn(onResults(result));
      };
    var answer = jolokia.execute(Fabric.managerMBean, "getConfigurationFile(java.lang.String, java.lang.String, java.lang.String)", versionId, profileId, fileName, onSuccess(callback));
    return fn ? answer : onResults(answer);
  }

  /**
   * Removes any attributes from the object that are set to an empty string.
   *
   * @method sanitizeJson
   * @for Fabric
   * @param {Object} json
   * @return {Object}
   */
  export function sanitizeJson(json:Object) {
    angular.forEach(json, (value, key) => {
      if (value === "") {
        delete json[key];
      }
    });
    return json;
  }

}
