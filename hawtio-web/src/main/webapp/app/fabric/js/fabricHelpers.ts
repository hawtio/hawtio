/**
 * @module Fabric
 */
/// <reference path="fabricInterfaces.ts"/>
/// <reference path="fabricGlobals.ts"/>
/// <reference path="jolokiaHelpers.ts"/>
/// <reference path="containerHelpers.ts"/>
/// <reference path="schemaConfigure.ts"/>
/// <reference path="../../git/js/gitHelpers.ts"/>
/// <reference path="../../ui/js/dialog.ts"/>
/// <reference path="../../wiki/js/wikiHelpers.ts"/>
/// <reference path="iconRegistry.ts"/>
/// <reference path="../../core/js/login.ts"/>
module Fabric {

  export var OpenShiftCredentials = <Core.UserDetails> {
    username: null,
    password: null
  };

  export function fabricCreated(workspace) {
    return workspace.treeContainsDomainAndProperties(Fabric.jmxDomain, {type: "Fabric"});
  }

  export function canBootstrapFabric(workspace) {
    return hasClusterBootstrapManager(workspace);
  }

  export function hasClusterBootstrapManager(workspace) {
    return workspace.treeContainsDomainAndProperties(Fabric.jmxDomain, {type: "ClusterBootstrapManager"});
  }

  export function hasClusterServiceManager(workspace) {
    return workspace.treeContainsDomainAndProperties(Fabric.jmxDomain, {type: "ClusterServiceManager"});
  }

  export function hasZooKeeper(workspace) {
    return workspace.treeContainsDomainAndProperties(Fabric.jmxDomain, {type: "ZooKeeper"});
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
    var hasFabric = Fabric.hasFabric(workspace);
    var hasSchemaMBean = Fabric.hasSchemaMBean(workspace);
    var hasGitMBean = Fabric.hasGitMBean(workspace);

    return hasFabric &&
           hasSchemaMBean &&
           hasGitMBean;
  }

  export function hasFabric(workspace):boolean {
    // lets make sure we only have a fabric if we have
    // the ClusterServiceManager or ClusterBootstrapManager available
    // so that we hide Fabric for 6.0 or earlier of JBoss Fuse
    // which doesn't have the necessary mbeans for hawtio awesomeness
    return fabricCreated(workspace) &&
        (hasClusterServiceManager(workspace) || hasClusterBootstrapManager(workspace) || hasZooKeeper(workspace));
  }

  /**
   * Adds a bunch of common helper functions to the given scope
   * @method initScope
   * @for Fabric
   * @param {*} $scope
   * @param {ng.ILocationService} $location
   * @paran {*} jolokia
   * @param {Workspace} workspace
   */
  export function initScope($scope:any, $location, jolokia, workspace) {

    // Let's avoid re-defining everything if the $scope
    // has already been initialized here
    if ($scope.fabricInitialized) {
      return;
    } else {
      $scope.fabricInitialized = true;
    }

    ContainerHelpers.decorate($scope, $location, jolokia);

    $scope.gotoProfile = (versionId:string, profileId:string) => {
      Fabric.gotoProfile(workspace, jolokia, workspace.localStorage, $location, versionId, profileId);
    };

    $scope.refreshProfile = (versionId, profileId) => {
      log.debug('Refreshing profile: ' + profileId + '/' + versionId);
      if (!versionId || !profileId) {
        return;
      }
      jolokia.request({
        type: 'exec',
        mbean: Fabric.managerMBean,
        operation: 'refreshProfile',
        arguments: [versionId, profileId]
      }, {
        method: 'POST',
        success: () => {
          Core.notification('success', 'Triggered refresh of profile ' + profileId + '/' + versionId);
          Core.$apply($scope);
        },
        error: (response) => {
          log.warn('Failed to trigger refresh for profile ' + profileId + '/' + versionId + ' due to: ', response.error);
          log.info("Stack trace: ", response.stacktrace);
          Core.$apply($scope);
        }
      })
    };

    $scope.getVersionsToExclude = () => {
      if (!$scope.selectedContainers || $scope.selectedContainers.length === 0) {
        return [];
      }
      var answer = $scope.selectedContainers.map(c => c['versionId']);
      answer = answer.unique();
      if (answer.length > 1) {
        return [];
      } else {
        return answer;
      }
    };

    $scope.hasFabricWiki = () => {
      return Git.isGitMBeanFabric(workspace);
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
      var kind:string = null;
      // lets see if there is an openshift option
      var providers = registeredProviders(jolokia);
      angular.forEach(["openshift", "docker", "jclouds"], (value) => {
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
      if (!container.root || !container.alive) {
        return;
      }
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

    $scope.isEnsembleContainer = (containerId) => {
      if (angular.isArray($scope.ensembleContainerIds)) {
        return $scope.ensembleContainerIds.any(containerId);
      }
      return false;
    };

    // for connection dialog
    $scope.connect = {
      dialog: new UI.Dialog(),
      saveCredentials: false,
      userName: null,
      password: null,
      container: null,
      view: null,

      onOK: () => {
        var userName = $scope.connect.userName;
        var password = $scope.connect.password;
        var userDetails = <Core.UserDetails> Core.injector.get('userDetails');
        if (!userDetails.password) {
          // this can get unset if the user happens to refresh and hasn't checked rememberMe
          userDetails.password = password;
        }
        var container = <Fabric.Container>$scope.connect.container;
        if ($scope.connect.saveCredentials) {
          $scope.connect.saveCredentials = false;
          if (userName) {
            localStorage['fabric.userName'] = userName;
          }
          if (password) {
            localStorage['fabric.password'] = password;
          }
        }
        var options = Core.createConnectOptions({
          jolokiaUrl: container.jolokiaUrl,
          userName: userName,
          password: password,
          useProxy: true,
          view: $scope.connect.view,
          name: container.id
        });
        Core.connectToServer(localStorage, options);
        $scope.connect.container = {};
        setTimeout(() => {
          $scope.connect.dialog.close();
          Core.$apply($scope);
        }, 100);
      }
    };

    $scope.doConnect = (container, view) => {
      if (!$scope.canConnect(container)) {
        return;
      }
      var userDetails = <Core.UserDetails> Core.injector.get('userDetails');
      $scope.connect.userName = <any>(userDetails.remoteJolokiaUserDetails && userDetails.remoteJolokiaUserDetails.username ? userDetails.remoteJolokiaUserDetails.username : userDetails.username);
      $scope.connect.password = <any>(userDetails.remoteJolokiaUserDetails && userDetails.remoteJolokiaUserDetails.password ? userDetails.remoteJolokiaUserDetails.password : userDetails.password);
      $scope.connect.container = container;
      $scope.connect.view = view || "#/openlogs";

      var alwaysPrompt = localStorage['fabricAlwaysPrompt'];
      if ((alwaysPrompt && alwaysPrompt !== "false") || !$scope.connect.userName || !$scope.connect.password) {
        $scope.connect.dialog.open();
      } else {
        $scope.connect.onOK();
      }
    };

    // ids of containers being deleted, to prevent from issuing delete call more than once before we get any response
    // this "protection" is only $scope based
    $scope.deletePending = {};

    $scope.deleteContainer = () => {
      if ($scope.selectedContainers.all((c) => { return !$scope.deletePending[c.id]; })) {
        $scope.confirmDeleteDialog.open();
      }
    };

    // is it possible to delete selected containers? no, if deletion of container didn't complete
    $scope.mayDelete = () => {
      return $scope.selectedContainers.length > 0 && $scope.selectedContainers.all((c) =>
          { return !$scope.deletePending[c.id] && !(c.root && c.ensembleServer)});
    };

    $scope.confirmDeleteDialog = {
      dialog: new UI.Dialog(),
      onOk: () => {
        $scope.confirmDeleteDialog.dialog.close();
        if (angular.isDefined($scope.containerId)) {
          $scope.deletePending[$scope.containerId] = true;
          // avoid any nasty errors that the container doesn't existing anymore
          Core.unregister(jolokia, $scope);
          $location.path('/fabric/containers');

          ContainerHelpers.doDeleteContainer($scope, jolokia, $scope.containerId, () => {
            delete $scope.deletePending[$scope.containerId];
          });

        } else if (angular.isDefined($scope.selectedContainers)) {
          $scope.selectedContainers.each((c) => {
            $scope.deletePending[c.id] = true;
            ContainerHelpers.doDeleteContainer($scope, jolokia, c.id, () => {
              delete $scope.deletePending[c.id];
            });
          });
        } else {
          // bail...
          log.info("Asked to delete containers but no containerId or selectedContainers attributes available");
        }
      },
      open: () => {
        $scope.confirmDeleteDialog.dialog.open();
      },
      close: () => {
        $scope.confirmDeleteDialog.dialog.close();
      }
    };

    $scope.$watch('selectedContainers', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        var num = $scope.selectedContainers.length;
        $scope.versionTitle = "Migrate " + Core.maybePlural(num, "Container") + " to:";
      }
    });

    $scope.onVersionChange = (version) => {

      var containerIds = [];

      if (angular.isDefined($scope.selectedContainers)) {
        containerIds = $scope.selectedContainers.map(c => c.id);
      } else if (angular.isDefined($scope.row)) {
        containerIds = [$scope.row.id];
      } else {
        return;
      }

      log.info("Setting version to " + version + " on containers: " + containerIds);

      Fabric.migrateContainers(jolokia, version, containerIds, () => {
        Core.notification('success', "Initiated container migration to version <strong>" + version + "</strong>, changes make take some time to complete");
        Core.$apply($scope);
      }, (response) => {
        Core.notification('error', 'Failed to migrate container ' + response.error);
        log.error("Failed to migrate containers due to ", response.error);
        log.info("Stack trace: ", response.stacktrace);
        Core.$apply($scope);
      });
    };

    var verbose = workspace.localStorage['fabricVerboseNotifications'];
    $scope.fabricVerboseNotifications = verbose && verbose !== "false";
  }

  export function viewVersion(versionId, $location, $scope) {
    var defaultTarget = '/wiki/branch/' + versionId + '/view/fabric/profiles';
    var path:string = $location.path();
    var branch = $scope.branch || $scope.$parent.branch;
    if (!path.startsWith('/wiki/branch/') || !branch) {
      $location.path(defaultTarget);
    } else {
      path = path.replace('/branch/' + branch, '/branch/' + versionId);
      $location.path(path);
    }
  }

  export function doCreateVersion($scope, jolokia, $location, newVersionName) {
    var success = function (response) {
      var newVersion = response.value.id;
      Core.notification('success', "Created version <strong>" + newVersion + "</strong>, switching to this new version");

      // broadcast events to force reloads
      var $rootScope = $scope.$root || $scope.$rootScope || $scope;
      if ($rootScope) {
        $rootScope.$broadcast('wikiBranchesUpdated');
      }
      viewVersion(newVersion, $location, $scope);
      Core.$apply($scope);
    };

    var error = function (response) {
      log.error("Failed to create version due to :", response.error);
      log.info("stack trace: ", response.stacktrace);
      Core.$apply($scope);
    };

    if (!Core.isBlank(newVersionName)) {
      Fabric.createVersionWithId(jolokia, newVersionName, success, error);
    } else {
      Fabric.createVersion(jolokia, success, error);
    }

  }

  export function sortVersions(versions, order:boolean) {
    return (versions || []).sortBy((v) => {
      var answer = parseFloat(v['id']);
      if (answer === NaN) {
        answer = v['id'];
      }
      return answer;
    }, order);
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
    if (profileId) {
      return profileId.replace(/-/g, "/") + profileSuffix;
    } else {
      return null;
    }
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
   * @param {Number} max
   * @param {number} count
   * @return {string}
   */
  export function containerCountBadgeStyle(min, max, count) {
    if (!max || max == -1) {
      max = Number.MAX_VALUE;
    }
    if (!min) {
      min = 0;
    }
    if (!count) {
      return "badge-important";
    } else {
      return min <= count && count <= max ? "badge-success" : "badge-warning";
    }
  }

  export function gotoProfile(workspace, jolokia, localStorage, $location, versionId, profile:any) {
    var path = '';
    if (angular.isString(profile)) {
      path = profileLink(workspace, jolokia, localStorage, versionId, profile);
    } else {
      path = profileLink(workspace, jolokia, localStorage, versionId, profile.id);
    }
    if (!Core.isBlank(path)) {
      $location.url(path);
    }
  }

  export function gotoContainer(containerId:string) {
    var $location = Core.injector.get('$location');
    $location.path(UrlHelpers.join('/fabric/container', containerId));
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

  export var urlResolvers = ['http:', 'ftp:', 'mvn:'];

  export function completeUri ($q, $scope, workspace, jolokia, something) {


  }

  // TODO cache the current active version? Then clear the cached value if we delete it
  export function getActiveVersion($location) {
    return $location.search()['cv'] || "1.0";
  }

  export interface IScopeWithApiURL extends ng.IScope {
    restApiUrl:string;
  };

  /**
   * Loads the restApiUrl property into the given $scope and added the helper function
   */
  export function loadRestApi(jolokia, workspace: Workspace, $scope:IScopeWithApiURL, callback:(response:any) => void = undefined) {
    if ($scope && !$scope.restApiUrl) {
      $scope.restApiUrl = DEFAULT_REST_API;
    }
    Fabric.restApiUrl(jolokia, (response) => {
      var answer: string = response.value || DEFAULT_REST_API;
      // if we are running inside a root fabric8 node then lets strip off the host and port
      // because on Docker / Kubernetes / OpenShift this could could be a port which is not
      // accessible to the browser
      if (Fabric.isFMCContainer(workspace)) {
        // lets strip the host/port from the URL
        try {
          var url = new URI(answer);
          var path = url.pathname();
          if (path) {
            answer = path;
            response.value = answer;
          }
        } catch (e) {
          // ignore
        }
        // If we're proxying...
        var connectionName = Core.getConnectionNameParameter(location.search);
        if (connectionName) {
          var connectionOptions = Core.getConnectOptions(connectionName);
          if (connectionOptions) {
            connectionOptions.path = answer;
            answer = <string>Core.createServerConnectionUrl(connectionOptions);
          }
        }
      }
      if ($scope) {
        $scope.restApiUrl = answer;
        log.info("got REST API: " + $scope.restApiUrl);
        Core.$apply($scope);
      } if (callback) {
        callback(response);
      }
    });
  }

  /**
   * Returns the fully qualified iconURL from the relative link
   */
  export function toIconURL($scope, iconURL) {
    if (!iconURL) {
      return iconURL;
    }
    var components = iconURL.split('/');
    var normalized = "";
    components.each((c) => {
      normalized += '/';
      if (/\.profile$/.test(c)) {
        var profileName = c.substr(0, c.length - 8);
        normalized += profileName.replace('-', '/') + ".profile";
      } else {
        normalized += c;
      }
    });
    iconURL = normalized.substr(1);
    var connectionName = Core.getConnectionNameParameter(location.search);
    if (connectionName) {
      // If we're proxying...
      var connectionOptions = Core.getConnectOptions(connectionName);
      if (connectionOptions && !/^proxy\/http/.test(iconURL)) {
        // relative URLs are prefixed with /<base>/git/
        connectionOptions.path = /^\//.test(iconURL) ? iconURL : Core.url("/git/") + iconURL;
        iconURL = <string>Core.createServerConnectionUrl(connectionOptions);
        // Fix iconURL in cases where jolokia URL was already set.
        if (iconURL.endsWith('jolokia')) {
            iconURL = iconURL.replace('jolokia', connectionOptions.path);
        }
      }
    } else {
      // no proxy
      iconURL = /^\//.test(iconURL) ? iconURL : Core.url("/git/") + iconURL;
    }

    return iconURL;
  }

  export function getVersionsInUse(jolokia, callback:(used:string[]) => void) {
    doAction('containers(java.util.List, java.util.List)', jolokia, [["versionId"], []],
     (response) => {
       var versionIds = response.value.map((el) => {
         return el['versionId'];
       }).unique();
       callback(versionIds);
     }, (response) => {
       log.debug("Failed to get versions in use: ", response);
       log.debug("Stack Trace: ", response.stacktrace);
     });
  }

  function onJolokiaUrlCreateJolokia(response, fn) {
    var jolokia:any = null;
    if (response) {
      var url = response.value;
      if (url) {
        // lets use a proxy if the URL is external
        url = Core.useProxyIfExternal(url);
        jolokia = Fabric.createJolokia(url);
      } else {
        if (response.error) {
          log.debug("Failed to fetch remote jolokia URL: ", response.error);
          log.debug("Stack trace: ", response.stacktrace);
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
  export function profileJolokia(jolokia, profileId, versionId, onJolokia):any {
    function onJolokiaUrl(response) {
      return onJolokiaUrlCreateJolokia(response, onJolokia);
    }
    if (profileId && versionId) {
      return Fabric.profileWebAppURL(jolokia, jolokiaWebAppGroupId, profileId, versionId, onJolokiaUrl, onJolokiaUrl);
    } else {
      onJolokia(null);
      return null;
    }
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

  /**
   * Get a list of icons for the container's JMX domains
   * @param container
   * @returns {Array}
   */
  export function getServiceList(container) {
    var answer = [];
    var javaContainer = true;
    if (angular.isDefined(container) && angular.isDefined(container.jmxDomains) && angular.isArray(container.jmxDomains) && container.alive) {
      answer = Fabric.serviceIconRegistry.getIcons(container.jmxDomains);
    }
    return answer;
  }

  /**
   * Get an icon that represents the type of the container
   * @param container
   * @returns {*}
   */
  export function getTypeIcon(container:Container) {
    var type = container.type;
    // use the type in the metadata if it's there...
    if (container.metadata && container.metadata.containerType) {
      type = container.metadata.containerType;
    }
    var answer = Fabric.containerIconRegistry.getIcon(type);
    if (!answer) {
      return Fabric.javaIcon;
    } else {
      return answer;
    }
  }

  /**
   * Perform an action on a profile if it's found in the group
   * @param group
   * @param targetId
   * @param action
   */
  export function usingProfile(group:Profile[], targetId:string, action:(profile:Profile) => void):void {
    var profile:Profile = group.find((p:Profile) => { return p.id === targetId; });
    if (profile) {
      action(profile);
    }
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

  export function setDefaultVersion(jolokia, newVersion, callback:() => void) {
    jolokia.setAttribute(Fabric.managerMBean, "DefaultVersion", newVersion, onSuccess((response) => {
      callback();
    }));
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
      var versionHref = Core.url("#/fabric/profiles?v=" + versionId);
      var versionLink =  "<a href='" + versionHref + "'>" + versionId + "</a>"
      row["versionHref"] = versionHref;
      row["versionLink"] = versionLink;

      var id = row['id'] || "";
      var title = "container " + id + " ";
      var img:string = "red-dot.png";
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
      var prefix:string = "";
      if (answer.length > 0) {
        prefix = " ";
      }
      answer += prefix + "<a href='" + Core.url("#/fabric/container/" + value + workspace.hash()) + "'>" + value + "</a>";
    });
    return answer;
  }

  export function profileLinks(workspace, versionId, values) {
    var answer = "";
    angular.forEach(toCollection(values), function (value, key) {
      var prefix:string = "";
      if (answer.length > 0) {
        prefix = " ";
      }
      answer += prefix + "<a href='" + Core.url("#/fabric/profile/" + versionId + "/" + value + workspace.hash()) + "'>" + value + "</a>";
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
      var containersHref = Core.url("#/fabric/containers?p=" + id);
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

  export function getZooKeeperFacadeMBean(workspace: Core.Workspace) {
    var folder = workspace.findMBeanWithProperties(jmxDomain, {type: "ZooKeeper"});
    return Core.pathGet(folder, "objectName");
  }

  export var statusTitle = ContainerHelpers.statusTitle;
  export var statusIcon = ContainerHelpers.statusIcon;

  /**
   * Creates a jolokia object for connecting to the container with the given remote jolokia URL
   * @method createJolokia
   * @param {String} url
   */
  export function createJolokia(url: string) {
    // lets default to the user/pwd for the login
    var userDetails = <Core.UserDetails> Core.injector.get("userDetails");
    log.info("Logging into remote jolokia " + url + " using user details: " + StringHelpers.toString(userDetails));
    return Core.createJolokia(url, <string> userDetails.username, <string> userDetails.password);
  }

  export function registeredProviders(jolokia) {
    var providers = jolokia.execute(Fabric.managerMBean, 'registeredValidProviders()');
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
    var answer:Array<Container> = jolokia.execute(Fabric.managerMBean, "containers(java.util.List)", fields, { method: 'POST' });
    return answer.filter((c) => { return c.root }).map(v => v["id"]);
  }

  /**
   * Queries the given fields on the contianers in the fabric invoking the given function or returning the results if the fn is null
   * @param jolokia
   * @param fields
   * @param fn
   * @return the result if fn is null
   */
  export function getContainersFields(jolokia, fields, fn = null) {
    return jolokia.execute(Fabric.managerMBean, "containers(java.util.List)", fields, onSuccess(fn));
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
    var profiles = [];
    if (versionId) {
      profiles = jolokia.execute(Fabric.managerMBean, "getProfiles(java.lang.String, java.util.List)", versionId, ['id', 'hidden', 'abstract'], { method: 'POST' });
    }

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
   * Creates a link to the given broker configuration so we can connect in the UI
   * @param workspace
   * @param jolokia
   * @param localStorage
   * @param brokerVersion
   * @param brokerProfile
   * @param brokerId
   * @return the link to the broker page
   */
  export function brokerConfigLink(workspace, jolokia, localStorage, brokerVersion, brokerProfile, brokerId) {
    var path = Fabric.profileLink(workspace, jolokia, localStorage, brokerVersion, brokerProfile);
    path += "/io.fabric8.mq.fabric.server-" + brokerId + ".properties";
    return path;
  }


  /**
   * Connects to the broker in a new window
   */
  export function connectToBroker($scope, container, postfix = null) {
    var view = "#/jmx/attributes?tab=activemq";
    if (postfix) {
      view += "&" + postfix;
    }
    $scope.doConnect(container, view);
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
