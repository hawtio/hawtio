module Perspective {

  /**
   * The location search parameter for specifying the perspective to view
   */
  export var perspectiveSearchId = "p";

  /**
   * Returns the current perspective ID based on the query parameter or the current
   * discovered perspective
   */
  export function currentPerspectiveId($location, workspace, jolokia, localStorage) {
    var perspective = $location.search()[perspectiveSearchId];
    if (!perspective) {
      perspective = Perspective.choosePerspective($location, workspace, jolokia, localStorage);
    }
    return perspective;
  }

  /**
   * Returns the top level tabs for the given perspective
   */
  export function topLevelTabs($location, workspace: Workspace, jolokia, localStorage) {
    var perspective = currentPerspectiveId($location, workspace, jolokia, localStorage);
    console.log("perspective: " + perspective);
    var data = perspective ? Perspective.metadata[perspective] : null;
    var answer = [];
    if (!data) {
      answer = workspace.topLevelTabs;
    } else {
      // lets iterate through the available tabs in the perspective
      var topLevelTabs = data.topLevelTabs;
      var list = topLevelTabs.includes || topLevelTabs.excludes;
      angular.forEach(list, (tabSpec) => {
        var href = tabSpec.href;
        if (href) {
          var tab = workspace.topLevelTabs.find((t) => {
            var thref = t.href();
            return thref && thref.startsWith(href);
          });
          if (tab) {
            answer.push(tab);
          }
        }
      });
      if (!topLevelTabs.includes) {
        // lets exclude the matched tabs
        answer = workspace.topLevelTabs.subtract(answer);
      }
    }
    return answer;
  }

  /**
   * Returns the perspective we should be using right now since none is specified
   */
  export function choosePerspective($location, workspace: Workspace, jolokia, localStorage) {
    var inFabric = Fabric.hasFabric(workspace);
    var hasGit = Wiki.isWikiEnabled(workspace, jolokia, localStorage);
    if (inFabric && hasGit) {
      return "fabric";
    } else if (inFabric) {
      return "local";
    }
    return null;
  }

  /**
   * Returns the default page after figuring out what the current perspective is
   */
  export function defaultPage($location, workspace: Workspace, jolokia, localStorage) {
    var answer = null;
    if ($location && workspace) {
      var topLevelTabs = Perspective.topLevelTabs($location, workspace, jolokia, localStorage);
      angular.forEach(topLevelTabs, (tab) => {
        var href = tab.href();
        if (href && !answer) {
          // exclude invalid tabs
          var validFn = tab.isValid;
          if (!validFn || validFn(workspace)) {
            answer =  Core.trimLeading(href, "#");
          }
        }
      });
    }
    return answer || '/help/index';
  }
}