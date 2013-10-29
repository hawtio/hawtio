module Fabric {

  export var log:Logging.Logger = Logger.get("Fabric");
  
  export var managerMBean = "org.fusesource.fabric:type=Fabric";
  export var clusterManagerMBean = "org.fusesource.fabric:type=ClusterServiceManager";
  export var clusterBootstrapManagerMBean = "org.fusesource.fabric:type=ClusterBootstrapManager";
  export var openShiftFabricMBean = "org.fusesource.fabric:type=OpenShift";
  export var mqManagerMBean = "org.fusesource.fabric:type=MQManager";

  export var useDirectoriesInGit = true;
  var fabricTopLevel = "fabric/profiles/";
  var profileSuffix = ".profile";


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

  export function hasFabric(workspace):bool {
    // lets make sure we only have a fabric if we have the ClusterBootstrapManager available
    // so that we hide Fabric for 6.0 or earlier of JBoss Fuse which doesn't have the necessary
    // mbeans for hawtio awesomeness
    return fabricCreated(workspace) && canBootstrapFabric(workspace);
  }

  /**
   * Adds a bunch of common helper functions to the given scope
   */
  export function initScope($scope, $location, jolokia, workspace) {
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
        if ($scope.connect.saveCredentials) {
          $scope.connect.saveCredentials = false;
          localStorage['fabric.userName'] = userName;
          localStorage['fabric.password'] = password;
        }
        console.log("Connecting as user " + userName);
        var options =  new Core.ConnectToServerOptions();
        options.view = $scope.connect.view;
        Fabric.connect(localStorage, container, userName, password, true, options);
        $scope.connect.container = {};
        $scope.connect.dialog.close();
      }
    };

    $scope.doConnect = (container, view) => {
      // TODO at least obfusicate this
      $scope.connect.userName = localStorage['fabric.userName'];
      $scope.connect.password = localStorage['fabric.password'];
      $scope.connect.container = container;
      $scope.connect.view = view || "/logs";
      $scope.connect.dialog.open();
    };

  }

  /**
   * Converts the given path from the wiki into a profile ID
   */
  export function pagePathToProfileId(pageId): string {
    var answer = null;
    if (pageId.has(fabricTopLevel) && pageId !== fabricTopLevel) {
      var profileId = pageId.remove(fabricTopLevel);
      if ((Fabric.useDirectoriesInGit || !profileId.has("/")) && (!Fabric.useDirectoriesInGit || profileId.endsWith(profileSuffix))) {
        if (Fabric.useDirectoriesInGit) {
          profileId = Core.trimTrailing(profileId, profileSuffix);
          profileId = profileId.replace(/\//g, "-");
        }
        answer = profileId;
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
   * @param min
   * @param count
   * @returns {string}
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

  export function deleteProfile(jolokia, version, id, success, error) {
    doAction('deleteProfile(java.lang.String, java.lang.String)', jolokia, [version, id], success, error);
  }

  export function profileWebAppURL(jolokia, webAppId, profileId, versionId, success, error) {
    doAction('profileWebAppURL', jolokia, [webAppId, profileId, versionId], success, error);
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
   * Default the values that are missing in the returned JSON
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
   */
  export function connect(localStorage, row, userName = "", password = "", useProxy = true, options:Core.ConnectToServerOptions = new Core.ConnectToServerOptions()) {
    options.jolokiaUrl = row.jolokiaUrl;
    options.userName = userName;
    options.password = password;
    options.useProxy = useProxy;

    Core.connectToServer(localStorage, options);

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
    jolokia.execute('io.hawt.jsonschema:type=SchemaLookup', 'getSchemaForClass(java.lang.String)', className, {
      method: 'POST',
      success: (value) => {
        cb(Fabric.customizeSchema(id, angular.fromJson(value)));
      }
    });
  }

  export function getDtoSchema(id, className, jolokia, cb) {
    jolokia.execute('io.hawt.jsonschema:type=SchemaLookup', 'getSchemaForClass(java.lang.String)', className, {
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


  export function getRootContainers(jolokia) {
    var fields = ["id", "root"];
    var answer = jolokia.execute(Fabric.managerMBean, "containers(java.util.List)", fields, { method: 'POST' });
    return answer.filter({root: true}).map(v => v["id"]);
  }

  export function getOpenShiftDomains(workspace ,jolokia, serverUrl, login, password, fn = null) {
    if (hasOpenShiftFabric(workspace) && serverUrl && login && password) {
      return jolokia.execute(Fabric.openShiftFabricMBean, "getDomains", serverUrl, login, password, onSuccess(fn));
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

  export function getConfigFile(jolokia, versionId, profileId, fileName) {
    var answer = jolokia.execute(Fabric.managerMBean, "getConfigurationFile(java.lang.String, java.lang.String, java.lang.String)", versionId, profileId, fileName)
    if (answer) {
      return answer.decodeBase64();
    }
    return null;
  }



}
