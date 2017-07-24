/// <reference path="../../core/js/coreHelpers.ts"/>
/// <reference path="../../core/js/preferenceHelpers.ts"/>
/// <reference path="../../junit/js/junitPlugin.ts"/>
/// <reference path="metadata.ts"/>
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
  export var perspectiveSearchId: string = "p";

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
  export function currentPerspectiveId($location:ng.ILocationService, workspace:Core.Workspace, jolokia, localStorage:Storage) {
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

  export function getPerspectiveById(id) {
    var answer;
    angular.forEach(Perspective.metadata, (perspective, key) => {
      if (key === id) {
        answer = perspective;
      }
    });
    return answer;
  }

  /**
   * Returns the top level tabs for the given perspectiveId
   * @method topLevelTabsForPerspectiveId
   * @for Perspective
   * @param {Core.Workspace} workspace
   * @param {String} perspective
   * @return {Array}
   */
  export function topLevelTabsForPerspectiveId(workspace: Workspace, perspective: string) {
    // lets sort using content which is the title in the navbar button, which is what the end user sees
    // if we sort on id, then they may be re-ordered, such as karaf.terminal
    var sortedTopLevelTabs = workspace.topLevelTabs.sortBy(f => f.content);
    var data = perspective ? Perspective.metadata[perspective] : null;
    var metaData = data;
    var answer = [];

    if (!data) {
      answer = sortedTopLevelTabs;
    } else {
      // lets iterate through the available tabs in the perspective
      var topLevelTabs = data.topLevelTabs;

      var includes = filterTabs(topLevelTabs.includes, workspace);
      var excludes = filterTabs(topLevelTabs.excludes, workspace);

      // now do extra filtering of excludes, if they have some conditions in the meta data
      if (metaData) {
        excludes = excludes.filter(t => {
          var metaTab = metaData.topLevelTabs.excludes.find(et => {
            var etid = et.id;
            return etid && etid === t.id;
          });
          if (metaTab != null && angular.isFunction(metaTab.onCondition)) {
            // not all tabs has on condition function, so use try .. catch
            var answer = metaTab.onCondition(workspace);
            if (answer) {
              log.debug("Plugin " + t.id + " excluded in perspective " + perspective);
              return true;
            } else {
              // the condition was false, so it does not apply
              return false;
            }
          }
          return true;
        })
      }

      // if the meta-data only had excludes, then it means all the top level tabs, excluding these
      if (!topLevelTabs.includes) {
        answer = sortedTopLevelTabs;
      } else {
        // if the meta-data had includes, then its only these
        answer = includes;
      }
      // and remove any excludes
      answer = answer.subtract(excludes);
    }
    return answer;
  }

  function filterTabs(tabs, workspace) {
    var matched = [];

    function pushMatchedTab(tabSpec, tab) {
      if (tab) {
        var content = tabSpec.content;
        if (content) {
          tab = angular.copy(tab)
          tab.content = content;
        }
        matched.push(tab);
      }
    }

    angular.forEach(tabs, (tabSpec) => {
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
        pushMatchedTab(tabSpec, tab);
      } else if (id) {
        var tab = workspace.topLevelTabs.find((t) => {
          var tid = t.id;
          return tid && tid === id;
        });
        pushMatchedTab(tabSpec, tab);
      } else if (rhref) {
        var tab = workspace.topLevelTabs.find((t) => {
          var thref = t.href();
          return thref && thref.match(rhref);
        });
        pushMatchedTab(tabSpec, tab);
      }
    });
    return matched;
  }

  /**
   * Filter the top level tabs to only include currently valid tabs.
   */
  export function filterOnlyValidTopLevelTabs(workspace, topLevelTabs) {
    var answer = topLevelTabs.filter(tab => {
      var href = tab.href();
      return href && isValidFunction(workspace, tab.isValid);
    });
    return answer;
  }

  /**
   * Filter the top level tabs to only include currently active tabs.
   */
  export function filterOnlyActiveTopLevelTabs(workspace, topLevelTabs) {
    var answer = topLevelTabs.filter(tab => {
      var href = tab.href();
      return href && isValidFunction(workspace, tab.isActive);
    });
    return answer;
  }

  /**
   * Returns the top level tabs for the given perspective (which are valid)
   * @method topLevelTabs
   * @for Perspective
   * @param {ng.ILocationService} $location
   * @param {Core.Workspace} workspace
   * @paran {*} jolokia
   * @param {any} localStorage
   * @return {Array}
   */
  export function getTopLevelTabsForPerspective($location, workspace: Workspace, jolokia, localStorage) {
    var perspective = currentPerspectiveId($location, workspace, jolokia, localStorage);

    var plugins = Core.configuredPluginsForPerspectiveId(perspective, workspace, jolokia, localStorage);
    var tabs = Core.filterTopLevelTabs(perspective, workspace, plugins);
    tabs = Perspective.filterOnlyValidTopLevelTabs(workspace, tabs);

    return tabs;
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
    var answer;

    var url = $location.url();
    var inFMC = Fabric.isFMCContainer(workspace);
    if (inFMC) {

      // noisy!
      //log.debug("Checking url: ", url);

      // TODO - this needs to be refactored so that plugins can extend how the perspective is chosen, as this breaks really easily

      // we want first time users on welcome/index/default page to be in the fabric perspective
      if (url.startsWith("/perspective/defaultPage") || url.startsWith("/login") || url.startsWith("/welcome") || url.startsWith("/index") ||
          // see metadata.ts for the fabric configuration for which plugins we want to be in the fabric perspective
          url.startsWith("/fabric") ||
          url.startsWith("/profiles") ||
          url.startsWith("/dashboard") ||
          url.startsWith("/health") ||
          (url.startsWith("/wiki") && url.has("/fabric/profiles")) ||
          (url.startsWith("/wiki") && url.has("/editFeatures"))) {
        answer = "fabric";
      }
    }
    answer = answer || Perspective.defaultPerspective || "container";

    // noisy!
    // log.debug("Choose perspective url: " + $location.url() + ", in fabric: " + inFMC + " -> " + answer);
    return answer;
  }

  /**
   * Returns the default page after figuring out what the current perspective is
   * @method defaultPage
   * @for Perspective
   * @param {ng.ILocationService} $location
   * @param {Core.Workspace} workspace
   * @paran {Jolokia.IJolokia} jolokia
   * @param {Storage} localStorage
   * @return {String}
   */
  export function defaultPage($location, workspace: Workspace, jolokia: Jolokia.IJolokia, localStorage: Storage) {
    // we should not show welcome screen from junit
    var isJUnit = JUnit.isJUnitPluginEnabled(workspace);
    if (isJUnit) {
      log.info("JUnit detected");
      // for junit we want to force junit as the default page
      return "/junit/tests";
    }

    // we should not show welcome screen from proxy or form chrome app
    var isProxy = Core.isProxyUrl($location);
    var isChomeApp = Core.isChromeApp();

    if (!isProxy && !isChomeApp && shouldShowWelcomePage(localStorage)) {
      return "/welcome";
    }

    // now find the configured default plugin, and then find the top level tab that matches the default plugin
    var answer = Perspective.defaultPageLocation;
    if (!answer && $location && workspace) {
      var perspectiveId = currentPerspectiveId($location, workspace, jolokia, localStorage);
      var defaultPlugin = Core.getDefaultPlugin(perspectiveId, workspace, jolokia, localStorage);
      var tabs = Perspective.topLevelTabsForPerspectiveId(workspace, perspectiveId);
      tabs = Perspective.filterOnlyValidTopLevelTabs(workspace, tabs);

      var defaultTab;
      if (defaultPlugin) {
        tabs.forEach(tab => {
          if (tab.id === defaultPlugin.id) {
            defaultTab = tab;
          }
        });
      } else {
        // if no default plugin configured, then select the 1st tab as default
        defaultTab = tabs[0];
      }

      if (defaultTab) {
        // clip the href to get the path to the plugin
        answer = Core.trimLeading(defaultTab.href(), "#");
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

  /**
   * Returns true if there is no validFn defined or if its defined
   * then the function returns true.
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
