module Maven {
  /**
   * Returns the maven indexer mbean (from the hawtio-maven-indexer library)
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
