/**
 * @module Core
 */

/// <reference path="corePlugin.ts"/>
/// <reference path="./helpRegistry.ts"/>
/// <reference path="./preferencesRegistry.ts"/>
/// <reference path="../../themes/js/themesPlugin.ts"/>
module Core {

  // Create the workspace object used in all kinds of places
  _module.factory('workspace',["$location", "jmxTreeLazyLoadRegistry","$compile", "$templateCache", "localStorage", "jolokia", "jolokiaStatus", "$rootScope", "userDetails", ($location:ng.ILocationService,jmxTreeLazyLoadRegistry, $compile:ng.ICompileService,$templateCache:ng.ITemplateCacheService, localStorage:WindowLocalStorage, jolokia, jolokiaStatus, $rootScope, userDetails) => {

      var answer = new Workspace(jolokia, jolokiaStatus, jmxTreeLazyLoadRegistry, $location, $compile, $templateCache, localStorage, $rootScope, userDetails);
      answer.loadTree();
      return answer;
  }]);

  _module.service('ConnectOptions', ['$location', ($location:ng.ILocationService) => {
    var connectionName = Core.ConnectionName;
    if (!Core.isBlank(connectionName)) {
      var answer = Core.getConnectOptions(connectionName);
      log.debug("ConnectOptions: ", answer);
      return answer;
    }
    log.debug("No connection options, connected to local JVM");
    return null;
  }]);

  // local storage service to wrap the HTML5 browser storage
  _module.service('localStorage',() => {
    return Core.getLocalStorage();
  });

  // service that's used to set the page title so it can be dynamically updated
  _module.factory('pageTitle', () => {
    var answer = new Core.PageTitle();
    return answer;
  });

  // Holds a mapping of plugins to layouts, plugins use this to specify a full width view, tree view or their own custom view
  _module.factory('viewRegistry',() => {
    return {};
  });

  // should hold the last URL that the user was on after a route change
  _module.factory('lastLocation', () => {
    return {};
  });

  _module.factory('locationChangeStartTasks', () => {
    return new Core.ParameterizedTasksImpl();
  });

  // service to register stuff that should happen when the user logs in
  _module.factory('postLoginTasks', () => {
    return Core.postLoginTasks;
  });

  // service to register stuff that should happen when the user logs out
  _module.factory('preLogoutTasks', () => {
    return Core.preLogoutTasks;
  });

  // service to register stuff that should happen after the user logs out
  _module.factory('postLogoutTasks', () => {
    return Core.postLogoutTasks;
  });

  // help registry for registering help topics/pages to
  _module.factory('helpRegistry', ["$rootScope", ($rootScope) => {
    return new Core.HelpRegistry($rootScope);
  }]);

  // preference registry service that plugins can register preference pages to
  _module.factory('preferencesRegistry', () => {
    return new Core.PreferencesRegistry();
  });

  // service for the javascript object that does notifications
  _module.factory('toastr', ["$window", ($window) => {
    var answer: any = $window.toastr;
    if (!answer) {
      // lets avoid any NPEs
      answer = {};
      $window.toaster = answer;
    }
    return answer;
  }]);

  // service for the codehale metrics
  _module.factory('metricsWatcher', ["$window", ($window) => {
    var answer: any = $window.metricsWatcher;
    if (!answer) {
      // lets avoid any NPEs
      answer = {};
      $window.metricsWatcher = metricsWatcher;
    }
    return answer;
  }]);

  // service for xml2json, should replace with angular.to/from json functions
  _module.factory('xml2json', () => {
    var jquery:any = $;
    return jquery.xml2json;
  });

  // the jolokia URL we're connected to, could probably be a constant
  _module.factory('jolokiaUrl', () => {
    return jolokiaUrl;
  });

  // holds the status returned from the last jolokia call and hints for jolokia.list optimization
  _module.factory('jolokiaStatus', () => {
    return {
      xhr: null,
      listMethod: LIST_GENERAL,
      listMBean: "hawtio:type=security,name=RBACRegistry"
    };
  });

  // constant meaning that general LIST+EXEC Jolokia operations should be used
  export var LIST_GENERAL = "list";
  // constant meaning that optimized hawtio:type=security,name=RBACRegistry may be used
  export var LIST_WITH_RBAC = "list_rbac";
  // when we get this status, we have to try checking again after logging in
  export var LIST_CANT_DETERMINE = "cant_determine";

  export var DEFAULT_MAX_DEPTH = 7;
  export var DEFAULT_MAX_COLLECTION_SIZE = 50000;

  _module.factory('jolokiaParams', ["jolokiaUrl", "localStorage", (jolokiaUrl, localStorage) => {
    var answer = {
      canonicalNaming: false,
      ignoreErrors: true,
      mimeType: 'application/json',
      maxDepth: DEFAULT_MAX_DEPTH,
      maxCollectionSize: DEFAULT_MAX_COLLECTION_SIZE
    };
    if ('jolokiaParams' in localStorage) {
      answer = angular.fromJson(localStorage['jolokiaParams']);
    } else {
      localStorage['jolokiaParams'] = angular.toJson(answer);
    }
    answer['url'] = jolokiaUrl;
    return answer;
  }]);

  // branding service, controls app name and logo
  _module.factory('branding', () => {
    var branding = Themes.brandings['hawtio'].setFunc({});
    branding.logoClass = () => {
        if (branding.logoOnly) {
          return "without-text";
        } else {
          return "with-text";
        }
      };
    return branding;
  });

  // service that holds cached jolokia responses, indexed by mbean name
  _module.factory('ResponseHistory', () => {
    var answer = Core.getResponseHistory();
    return answer;
  });

  // user detail service, contains username/password
  _module.factory('userDetails', ["ConnectOptions", "localStorage", "$window", "$rootScope", (ConnectOptions:Core.ConnectOptions, localStorage:WindowLocalStorage, $window:ng.IWindowService, $rootScope:ng.IRootScopeService)  => {
    var answer = <UserDetails> {
      username: null,
      password: null
    };
    if('userDetails' in $window) {
      answer = $window['userDetails'];
      log.debug("User details loaded from parent window: ", StringHelpers.toString(answer));
      executePostLoginTasks();
    } else if ('userDetails' in localStorage) {
      answer = angular.fromJson(localStorage['userDetails']);
      log.debug("User details loaded from local storage: ", StringHelpers.toString(answer));
      executePostLoginTasks();
    } else if (Core.isChromeApp()) {
      answer = <Core.UserDetails> {
        username: 'user',
        password: ''
      };
      log.debug("Running as a Chrome app, using fake UserDetails: ");
      executePostLoginTasks();
    } else {
      log.debug("No username set, checking if we have a session");
      // fetch the username if we've already got a session at the server
      var userUrl = "user";
      $.ajax(userUrl, <JQueryAjaxSettings> {
        type: "GET",
        success: (response) => {
          log.debug("Got user response: ", response);
          if (response === null) {
            answer.username = null;
            answer.password = null;
            log.debug("user response was null, no session available");
            Core.$apply($rootScope);
            return;
          }
          answer.username = response;
          // 'user' is what the UserServlet returns if authenticationEnabled is off
          if (response === 'user') {
            log.debug("Authentication disabled, using dummy credentials");
            // use a dummy login details
            answer.loginDetails = {};
          } else {
            log.debug("User details loaded from existing session: ", StringHelpers.toString(answer));
          }
          executePostLoginTasks();
          Core.$apply($rootScope);
        },
        error: (xhr, textStatus, error) => {
          answer.username = null;
          answer.password = null;
          log.debug("Failed to get session username: ", error);
          Core.$apply($rootScope);
          //executePostLoginTasks();
          // silently ignore, we could be using the proxy
        }
      });
      log.debug("Created empty user details to be filled in: ", StringHelpers.toString(answer));
    }
    return answer;
  }]);

  _module.factory('jmxTreeLazyLoadRegistry', () => {
    return Core.lazyLoaders;
  });

}
