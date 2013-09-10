module Perspective {

  /**
   * Returns the top level tabs for the given perspective
   */
  export function topLevelTabs($location, workspace) {
    var perspective = $location.search()["_p"];
    if (!perspective) {
      perspective = Perspective.choosePerspective($location, workspace);
    }
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
  export function choosePerspective($location, workspace) {
    return null;
  }

  /**
   * Returns the default page after figuring out what the current perspective is
   */
  export function defaultPage($location, workspace) {
    var answer = null;
    console.log("====== HEY - function with " + $location + " and workspace " + workspace);
    if ($location && workspace) {
      var topLevelTabs = Perspective.topLevelTabs($location, workspace);
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