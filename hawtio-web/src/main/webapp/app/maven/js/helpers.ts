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
}
