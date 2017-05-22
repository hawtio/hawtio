/**
 * @module IDE
 */
module IDE {

  /**
   * Returns the mbean name of the IDE Facade mbean if its available
   */
  export function getIdeMBean(workspace:Workspace) {
    return Core.getMBeanTypeObjectName(workspace, "hawtio", "IdeFacade");
  }

  /**
   * Returns true if open in IDEA is enabled
   */
  export function isOpenInIdeaSupported(workspace:Workspace, localStorage) {
    var value = localStorage["openInIDEA"];
    return value !== "false";
  }

  /**
   * Opens the file in IDEA
   */
  export function ideaOpenAndNavigate(mbean: string, jolokia, scope:SourceReference, fn = null) {
    var answer = null;
    if (mbean) {
      answer = jolokia.execute(mbean, "ideOpen", scope.fileName, scope.className, scope.line, scope.column, onSuccess(fn));
    }
    return answer;
  }

}
