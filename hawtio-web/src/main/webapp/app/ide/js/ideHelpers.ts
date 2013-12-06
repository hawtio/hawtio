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
   * Returns true if open in TextMate is enabled
   */
  export function isOpenInTextMateSupported(workspace:Workspace, localStorage) {
    var value = localStorage["openInTextMate"];
    return value !== "false";
  }

  /**
   * Attempts to find the absolute file name for the given file and class name
   */
  export function findClassAbsoluteFileName(mbean: string, jolokia, localStorage, fileName, className, onResult) {
    var sourceRoots = [];
    // TODO load from localStorage

    var answer = null;
    if (mbean) {
      answer = jolokia.execute(mbean, "findClassAbsoluteFileName", fileName, className, sourceRoots, onSuccess(onResult));
    } else {
      onResult(answer);
    }
    return answer;
  }

  function asNumber(value, defaultValue = 0) {
    if (angular.isNumber(value)) {
      return value;
    } else if (angular.isString(value)) {
      return parseInt(value);
    } else {
      return defaultValue;
    }
  }

  function max(v1, v2) {
    return (v1 >= v2) ? v1 : v2;
  }

  /**
   * Opens the file in IDEA
   */
  export function ideaOpenAndNavigate(mbean: string, jolokia, absoluteFileName, line, column, fn = null) {
    var answer = null;
    if (mbean) {
      line = max(asNumber(line) - 1, 0);
      column = max(asNumber(column) - 1, 0);
      answer = jolokia.execute(mbean, "ideaOpenAndNavigate", absoluteFileName, line, column, onSuccess(fn));
    }
    return answer;
  }

}
