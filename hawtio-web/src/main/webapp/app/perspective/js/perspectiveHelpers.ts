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
  export function topLevelTabsForPerspectiveId(workspace, perspective) {
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

    var plugins = configuredPluginsForPerspective(perspective, workspace, jolokia, localStorage);
    var tabs = filterTopLevelTabs(perspective, workspace, plugins);

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

  // TODO: Change this code due #853
  function isMatchDefaultPlugin(id, localStorage) {
    var value = localStorage["defaultPlugin"];
    if (angular.isString(id) && angular.isString(value)) {
      // if the default is the first then its a match
      return value === "_first" || id === value;
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
  export function isValidFunction(workspace, validFn) {
    return !validFn || validFn(workspace);
  }

  export var log:Logging.Logger = Logger.get("Preference");

  // TODO: duplicate code !!!

  /**
   * Parsers the given value as JSON if it is define
   */
  function parsePreferencesJson(value, key) {
    var answer = null;
    if (angular.isDefined(value)) {
      answer = Core.parseJsonText(value, "localStorage for " + key);
    }
    return answer;
  }

  /**
   * Function to return the configured plugin for the given perspective. The returned
   * list is sorted in the configured order.
   * Notice the list contains plugins which may have been configured as disabled.
   */
  function configuredPluginsForPerspective(perspective, workspace, jolokia, localStorage) {

    // grab the top level tabs which is the plugins we can select as our default plugin
    var topLevelTabs = Perspective.topLevelTabsForPerspectiveId(workspace, perspective);
    if (topLevelTabs && topLevelTabs.length > 0) {
      log.debug("Found " + topLevelTabs.length + " plugins");
      // exclude invalid tabs at first
      topLevelTabs = topLevelTabs.filter(tab => {
        var href = tab.href();
        return href && Perspective.isValidFunction(workspace, tab.isValid);
      });
      log.debug("After filtering there are " + topLevelTabs.length + " plugins");

      var initPlugins = parsePreferencesJson(localStorage['plugins'], "plugins");
      if (initPlugins) {
        initPlugins.forEach((tab, idx) => {
          log.info("Configured plugin " + tab.id + " at " + tab.index + " loaded at index " + idx);
        });

        // remove plugins which we cannot find active currently
        initPlugins = initPlugins.filter(p => {
          return topLevelTabs.some(tab => tab.id === p.id);
        });

        // add new active plugins which we didn't know about before
        topLevelTabs.forEach(tab => {
          var knownPlugin = initPlugins.filter(p => {
            p.id === tab.id
          });
          if (!knownPlugin) {
            log.info("Found new plugin " + tab.id);
            initPlugins.push({id: tab.id, index: -1, displayName: tab.content, enabled: true, isDefault: false})
          }
        });

      } else {
        // okay no configured saved yet, so use what is active
        initPlugins = topLevelTabs;
      }
    }

    // okay push plugins to scope so we can see them in the UI
    var answer = [];
    if (initPlugins) {
      initPlugins.forEach((tab, idx) => {
        log.info("Plugin " + tab.id + " at " + idx + " is " + tab.enabled + " enabled");
        var name;
        if (tab.displayName) {
          name = tab.displayName;
        } else {
          name = tab.content;
        }
        answer.push({id: tab.id, index: idx, displayName: name, enabled: tab.enabled, isDefault: tab.isDefault});
      });
    }

    return answer;
  }

  export function filterTopLevelTabs(perspective, workspace, configuredPlugins) {
    var topLevelTabs = Perspective.topLevelTabsForPerspectiveId(workspace, perspective);
    // only include the tabs accordingly to configured
    var result = [];
    configuredPlugins.forEach(p => {
      if (p.enabled) {
        var tab = topLevelTabs.find(t => t.id === p.id);
        if (tab) {
          result.push(tab);
        }
      }
    });
    return result;
  }
}
