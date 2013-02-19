module Git {

  export function createGitRepository(workspace:Workspace, jolokia, localStorage):GitRepository {
    var mbean = getGitMBean(workspace);
    if (mbean && jolokia) {
      return new JolokiaGit(mbean, jolokia, localStorage);
    }
    // TODO use local storage to make a little wiki thingy?
    return null;
  }

  export function getGitMBean(workspace:Workspace):string {
    if (workspace) {
      var mbeanTypesToDomain = workspace.mbeanTypesToDomain || {};
      var gitFacades = mbeanTypesToDomain["GitFacade"] || {};
      var hawtioFolder = gitFacades["io.hawt.git"] || {};
      return hawtioFolder["objectName"];
    }
    return null;
  }
}