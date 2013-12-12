/**
 * @module Perspective
 */
module Perspective {

  export var log:Logging.Logger = Logger.get("Perspective");

  /**
   * The location search parameter for specifying the perspective to view
   * @property perspectiveSearchId
   * @for Perspective
   * @type String
   */
  export var perspectiveSearchId = "p";

  /**
   * Lets you specify which perspective to default to if there's not a single active one
   * @property defaultPerspective
   * @for Perspective
   * @type String
   */
  export var defaultPerspective: string = null;

  /**
   * A hook so folks can specify the default start page explicitly if the first valid page in the
   * perspective is not the intended start page
   * @property defaultPageLocation
   * @for Perspective
   * @type String
   */
  export var defaultPageLocation: string = null;


  /**
   * Returns the current perspective ID based on the query parameter or the current
   * discovered perspective
   * @method currentPerspectiveId
   * @for Perspective
   * @param {ng.ILocationService} $location
   * @param {Core.Workspace} workspace
   * @paran {*} jolokia
   * @param {any} localStorage
   * @return {String}
   */
  export function currentPerspectiveId($location, workspace, jolokia, localStorage) {
    var perspective = $location.search()[perspectiveSearchId];
    if (!perspective) {
      perspective = Perspective.choosePerspective($location, workspace, jolokia, localStorage);
    }
    return perspective;
  }

  /**
   * Returns an array of all the active perspectives
   * @method getPerspectives
   * @for Perspective
   * @param {ng.ILocationService} $location
   * @param {Core.Workspace} workspace
   * @paran {*} jolokia
   * @param {any} localStorage
   */
  export function getPerspectives($location, workspace, jolokia, localStorage) {
    var perspectives = [];
    angular.forEach(Perspective.metadata, (perspective, key) => {
      if (isValidFunction(workspace, perspective.isValid)) {
        if (!perspective.label) {
          perspective.label = key;
        }
        if (!perspective.title) {
          perspective.title = perspective.label;
        }
        perspective.id = key;
        perspectives.push(perspective);
      }
    });
    return perspectives;
  }

  /**
   * Returns the top level tabs for the given perspectiveId
   * @method topLevelTabsForPerspectiveId
   * @for Perspective
   * @param {Core.Workspace} workspace
   * @param {String} perspective
   * @return {Array}
   */
  function topLevelTabsForPerspectiveId(workspace, perspective) {
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
        var id = tabSpec.id;
        var rhref = tabSpec.rhref;
        if (href) {
          var hrefValue = href;
          if (angular.isFunction(href)) {
            hrefValue = href();
          }
          var tab = workspace.topLevelTabs.find((t) => {
            var thref = t.href();
            return thref && thref.startsWith(hrefValue);
          });
          if (!tab && !id && tabSpec.content) {
            // lets assume the tab is the tabSpec
            tab = tabSpec;
          }
          if (tab) {
            answer.push(tab);
          }
        } else if (id) {
          var tab = workspace.topLevelTabs.find((t) => {
            var tid = t.id;
            return tid && tid === id;
          });
          if (tab) {
            answer.push(tab);
          }
        } else if (rhref) {
          var tab = workspace.topLevelTabs.find((t) => {
            var thref = t.href();
            return thref && thref.match(rhref);
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
   * Returns the top level tabs for the given perspective
   * @method topLevelTabs
   * @for Perspective
   * @param {ng.ILocationService} $location
   * @param {Core.Workspace} workspace
   * @paran {*} jolokia
   * @param {any} localStorage
   * @return {Array}
   */
  export function topLevelTabs($location, workspace: Workspace, jolokia, localStorage) {
    var perspective = currentPerspectiveId($location, workspace, jolokia, localStorage);
    //console.log("perspective: " + perspective);
    return topLevelTabsForPerspectiveId(workspace, perspective);
  }

  /**
   * Returns the perspective we should be using right now since none is specified
   * @method choosePerspective
   * @for Perspective
   * @param {ng.ILocationService} $location
   * @param {Core.Workspace} workspace
   * @paran {*} jolokia
   * @param {any} localStorage
   * @return {String}
   */
  export function choosePerspective($location, workspace: Workspace, jolokia, localStorage) {
    var inFMC = Fabric.isFMCContainer(workspace);
    if (inFMC) {
      var url = $location.url();
      log.debug("Checking url: ", url);
      if (url.startsWith("/fabric") ||
          url.startsWith("/dashboard") ||
          (url.startsWith("/wiki") && url.has("/fabric/profiles")) ||
          (url.startsWith("/wiki") && url.has("/editFeatures"))) {
        return "fabric";
      }
    }
    return Perspective.defaultPerspective || "container";
  }

  /**
   * Returns the default page after figuring out what the current perspective is
   * @method defaultPage
   * @for Perspective
   * @param {ng.ILocationService} $location
   * @param {Core.Workspace} workspace
   * @paran {*} jolokia
   * @param {any} localStorage
   * @return {String}
   */
  export function defaultPage($location, workspace: Workspace, jolokia, localStorage) {
    if (shouldShowWelcomePage(localStorage)) {
      return "/welcome/";
    }

    var answer = Perspective.defaultPageLocation;
    if (!answer && $location && workspace) {
      var topLevelTabs = Perspective.topLevelTabs($location, workspace, jolokia, localStorage);

      // exclude invalid tabs at first
      topLevelTabs = topLevelTabs.filter(tab => {
        var href = tab.href();
        return href && isValidFunction(workspace, tab.isValid);
      });

      // pick the default plugin if any configured, as otherwise we pick the first
      topLevelTabs = topLevelTabs.filter(tab => {
        return isMatchDefaultPlugin(tab.id, localStorage);
      });

      // then pick the first if multiple matched
      var tab = topLevelTabs.length > 0 ? topLevelTabs[0] : null;
      if (tab) {
        // clip the href to get the path to the plugin
        answer = Core.trimLeading(tab.href(), "#");
      }
    }

    return answer || '/help/index';
  }

  /**
   * Whether to show the welcome page
   */
  export function shouldShowWelcomePage(localStorage) {
    var value = localStorage["showWelcomePage"];
    if (angular.isString(value)) {
      return "true" === value;
    }
    return true;
  }

  function isMatchDefaultPlugin(id, localStorage) {
    var value = localStorage["defaultPlugin"];
    if (angular.isString(id) && angular.isString(value)) {
      return id === value;
    }
    // if no default plugin then match as a favorite
    return true;
  }

  /**
   * Returns true if there is no validFn defined or if its defined
   * then the function returns true.
   *
   * TODO move to core?
   *
   * @method isValidFunction
   * @for Perspective
   * @param {Core.Workspace} workspace
   * @param {Function} validFn
   * @return {Boolean}
   */
  function isValidFunction(workspace, validFn) {
    return !validFn || validFn(workspace);
  }

}
