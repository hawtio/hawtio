module Git {

  export function createGitRepository(workspace:Workspace, jolokia, localStorage):GitRepository {
    var mbean = getGitMBean(workspace);
    if (mbean && jolokia) {
      return new JolokiaGit(mbean, jolokia, localStorage);
    }
    // TODO use local storage to make a little wiki thingy?
    return null;
  }

  export var jmxDomain = "io.hawt.git";
  export var mbeanType = "GitFacade";

  export function hasGit(workspace:Workspace) {
    return getGitMBean(workspace) !== null;
  }

  /**
   * Returns the JMX ObjectName of the git mbean
   */
  export function getGitMBean(workspace:Workspace):string {
    return Core.getMBeanTypeObjectName(workspace, Git.jmxDomain, Git.mbeanType);
  }

  /**
   * Returns the Folder for the git mbean if it can be found
   */
  export function getGitMBeanFolder(workspace:Workspace):Folder {
    return Core.getMBeanTypeFolder(workspace, Git.jmxDomain, Git.mbeanType);
  }

  /**
   * Returns true if the git mbean is a fabric configuration repository
   * (so we can use it for the fabric plugin)
   */
  export function isGitMBeanFabric(workspace:Workspace):boolean {
    var folder = getGitMBeanFolder(workspace);
    return folder && folder.entries["repo"] === "fabric";
  }
}
