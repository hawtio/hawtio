/**
 * @module Maven
 */
module Maven {

  export var log:Logging.Logger = Logger.get("Maven");

  /**
   * Returns the maven indexer mbean (from the hawtio-maven-indexer library)
   * @method getMavenIndexerMBean
   * @for Maven
   * @param {Core.Workspace} workspace
   * @return {String}
   */
  export function getMavenIndexerMBean(workspace:Workspace) {
    if (workspace) {
      var mavenStuff = workspace.mbeanTypesToDomain["Indexer"] || {};
      var object = mavenStuff["io.hawt.maven"] || {};
      return object.objectName;
    } else return null;
  }

  export function getAetherMBean(workspace:Workspace) {
    if (workspace) {
      var mavenStuff = workspace.mbeanTypesToDomain["AetherFacade"] || {};
      var object = mavenStuff["io.hawt.aether"] || {};
      return object.objectName;
    } else return null;
  }

  export function mavenLink(url) {
    var path = null;
    if (url) {
      if (url.startsWith("mvn:")) {
        path = url.substring(4);
      } else {
        var idx = url.indexOf(":mvn:");
        if (idx > 0) {
          path = url.substring(idx + 5);
        }
      }
    }
    return path ? "#/maven/artifact/" + path : null;
  }

  export function getName(row) {
    var id = (row.group || row.groupId) + "/" + (row.artifact || row.artifactId);
    if (row.version) {
      id += "/" + row.version;
    }
    if (row.classifier) {
      id += "/" + row.classifier;
    }
    if (row.packaging) {
      id += "/" + row.packaging;
    }
    return id;
  }


  export function completeMavenUri($q, $scope, workspace, jolokia, query) {

    var mbean = getMavenIndexerMBean(workspace);
    if (!angular.isDefined(mbean)) {
      return $q.when([]);
    }

    var parts = query.split('/');
    if (parts.length === 1) {
      // still searching the groupId
      return Maven.completeGroupId(mbean, $q, $scope, workspace, jolokia, query, null, null);
    }
    if (parts.length === 2) {
      // have the groupId, guess we're looking for the artifactId
      return Maven.completeArtifactId(mbean, $q, $scope, workspace, jolokia, parts[0], parts[1], null, null);
    }
    if (parts.length === 3) {
      // guess we're searching for the version
      return Maven.completeVersion(mbean, $q, $scope, workspace, jolokia, parts[0], parts[1], parts[2], null, null);
    }

    return $q.when([]);
  }


  export function completeVersion(mbean, $q, $scope, workspace, jolokia, groupId, artifactId, partial, packaging, classifier) {

    /*
    if (partial.length < 5) {
      return $q.when([]);
    }
    */

    var deferred = $q.defer();

    jolokia.request({
      type: 'exec',
      mbean: mbean,
      operation: 'versionComplete(java.lang.String, java.lang.String, java.lang.String, java.lang.String, java.lang.String)',
      arguments: [groupId, artifactId, partial, packaging, classifier]
    }, {
      method: 'POST',
      success: (response) => {
        $scope.$apply(() => {
          deferred.resolve(response.value.sortBy().first(15));
        });
      },
      error: (response) => {
        $scope.$apply(() => {
          console.log("got back an error: ", response);
          deferred.reject();
        });
      }
    });

    return deferred.promise;

  }

  export function completeArtifactId(mbean, $q, $scope, workspace, jolokia, groupId, partial, packaging, classifier) {

    var deferred = $q.defer();

    jolokia.request({
      type: 'exec',
      mbean: mbean,
      operation: 'artifactIdComplete(java.lang.String, java.lang.String, java.lang.String, java.lang.String)',
      arguments: [groupId, partial, packaging, classifier]
    }, {
      method: 'POST',
      success: (response) => {
        $scope.$apply(() => {
          deferred.resolve(response.value.sortBy().first(15));
        });
      },
      error: (response) => {
        $scope.$apply(() => {
          console.log("got back an error: ", response);
          deferred.reject();
        });
      }
    });

    return deferred.promise;
  }

  export function completeGroupId(mbean, $q, $scope, workspace, jolokia, partial, packaging, classifier) {

    // let's go easy on the indexer
    if (partial.length < 5) {
      return $q.when([]);
    }

    var deferred = $q.defer();

    jolokia.request({
      type: 'exec',
      mbean: mbean,
      operation: 'groupIdComplete(java.lang.String, java.lang.String, java.lang.String)',
      arguments: [partial, packaging, classifier]
    }, {
      method: 'POST',
      success: (response) => {
        $scope.$apply(() => {
          deferred.resolve(response.value.sortBy().first(15));
        });
      },
      error: (response) => {
        console.log("got back an error: ", response);
        $scope.$apply(() => {
          deferred.reject();
        });
      }
    });

    return deferred.promise;
  }

  export function addMavenFunctions($scope, workspace) {
    $scope.detailLink = (row) => {
      var group = row.groupId;
      var artifact = row.artifactId;
      var version = row.version || "";
      var classifier = row.classifier || "";
      var packaging = row.packaging || "";
      if (group && artifact) {
        return "#/maven/artifact/" + group + "/" + artifact + "/" + version + "/" + classifier + "/" + packaging;
      }
      return "";
    };

    $scope.javadocLink = (row) => {
      var group = row.groupId;
      var artifact = row.artifactId;
      var version = row.version;
      if (group && artifact && version) {
        return "javadoc/" + group + ":" + artifact + ":" + version + "/";
      }
      return "";
    };

    $scope.versionsLink = (row) => {
      var group = row.groupId;
      var artifact = row.artifactId;
      var classifier = row.classifier || "";
      var packaging = row.packaging || "";
      if (group && artifact) {
        return "#/maven/versions/" + group + "/" + artifact + "/" + classifier + "/" + packaging;
      }
      return "";
    };

    $scope.dependenciesLink = (row) => {
      var group = row.groupId;
      var artifact = row.artifactId;
      var classifier = row.classifier || "";
      var packaging = row.packaging || "";
      var version = row.version;
      if (group && artifact) {
        return "#/maven/dependencies/" + group + "/" + artifact + "/" +  version + "/" + classifier + "/" + packaging;
      }
      return "";
    };

    $scope.hasDependencyMBean = () => {
      var mbean = Maven.getAetherMBean(workspace);
      return angular.isDefined(mbean);
    };

    $scope.sourceLink = (row) => {
      var group = row.groupId;
      var artifact = row.artifactId;
      var version = row.version;
      if (group && artifact && version) {
        return "#/source/index/" + group + ":" + artifact + ":" + version + "/";
      }
      return "";
    };
  }
}
