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

  export function addMavenFunctions($scope) {
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
