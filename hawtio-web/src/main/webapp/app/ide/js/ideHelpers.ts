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
    //sanitize parameters that will fail if backend cannot parse to Int
    if(isInvalidAsNumber(scope.line)) {
        scope.line = null;
    }
    if(isInvalidAsNumber(scope.column)) {
        scope.column = null;
    }
    if (mbean) {
      answer = jolokia.execute(mbean, "ideOpen", scope.fileName, scope.className, scope.line, scope.column, onSuccess(fn));
    }
    return answer;
  }
  
  function isInvalidAsNumber(value:any):boolean {
      return !value || isNaN(value);
  }

}
