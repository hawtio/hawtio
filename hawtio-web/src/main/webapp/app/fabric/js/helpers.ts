module Fabric {
  
  export var managerMBean = "org.fusesource.fabric:type=Fabric";
  export var clusterManagerMBean = "org.fusesource.fabric:type=ClusterServiceManager";
  export var clusterBootstrapManagerMBean = "org.fusesource.fabric:type=ClusterBootstrapManager";

  export var useDirectoriesInGit = true;
  var fabricTopLevel = "fabric/profiles/";
  var profileSuffix = ".profile";

  export function hasFabric(workspace) {
    // lets make sure we only have a fabric if we have the ClusterBootstrapManager available
    // so that we hide Fabric for 6.0 or earlier of JBoss Fuse which doesn't have the necessary
    // mbeans for hawtio awesomeness
    return workspace.treeContainsDomainAndProperties(Fabric.jmxDomain, {type: "Fabric"})
            && workspace.treeContainsDomainAndProperties(Fabric.jmxDomain, {type: "ClusterBootstrapManager"});
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

  export function initScope($scope, workspace) {
    $scope.hasFabricWiki = () => {
      return Git.isGitMBeanFabric(workspace);
    }
  }

  export function gotoProfile(workspace, jolokia, localStorage, $location, versionId, profile) {
    if (Wiki.isWikiEnabled(workspace, jolokia, localStorage)) {
      $location.url("/wiki/branch/" + versionId + "/view/fabric/profiles/" + Fabric.profilePath(profile.id));
    } else {
      $location.url("/fabric/profile/" + versionId + "/" + profile.id);
    }
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
  export function connect(localStorage, row, userName = "", password = "", useProxy = true) {
    var options:Core.ConnectToServerOptions = new Core.ConnectToServerOptions();
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



}
