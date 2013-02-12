module Git {

  export function createGitRepository(workspace: Workspace, jolokia, localStorage): GitRepository {
    if (workspace && jolokia) {
      var mbeanTypesToDomain = workspace.mbeanTypesToDomain || {};
      var gitFacades = mbeanTypesToDomain["GitFacade"] || {};
      var hawtioFolder = gitFacades["io.hawt.git"] || {};
      var mbean = hawtioFolder["objectName"];
      if (mbean) {
        return new JolokiaGit(mbean, jolokia, localStorage);
      }
      return null;
    }
  }
}