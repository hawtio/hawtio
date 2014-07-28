/**
 * The main entry point for hawtio
 *
 * @module Core
 * @main Core
 */

/// <reference path="./coreHelpers.ts"/>
/// <reference path="../../ide/js/idePlugin.ts"/>
/// <reference path="./pageTitle.ts"/>
module Core {

  /**
   * Name of plugin registered to hawtio's plugin loader and Angularjs module name
   *
   * @property pluginName
   * @for Core
   * @type String
   */
  export var pluginName = 'hawtioCore';

  /**
   * Path to template files for this plugin
   *
   * @property pluginName
   * @for Core
   * @type String
   */
  export var templatePath = 'app/core/html/';


  /**
   * URL we've detected to find jolokia at we figure this out
   * at script loading time
   */
  // TODO - maybe we can make discovering this async before we call hawtioPluginLoader.loadPlugins() to avoid the blocking HTTP requests it makes currently
  export var jolokiaUrl = getJolokiaUrl();
  Logger.get("Core").debug("jolokiaUrl " + jolokiaUrl);

  /**
   * The main hawtio core App module
   */
  export var _module = angular.module(Core.pluginName, ['bootstrap', 'ngResource', 'ui', 'ui.bootstrap.dialog', 'hawtio-ui']);

  // configure the module
  _module.config(["$routeProvider", "$dialogProvider", ($routeProvider:ng.route.IRouteProvider, $dialogProvider) => {
    $dialogProvider.options({
      backdropFade: true,
      dialogFade: true
    });

    $routeProvider.
            when('/login', {templateUrl: Core.templatePath + 'login.html'}).
            when('/welcome', {templateUrl: Core.templatePath + 'welcome.html'}).
            when('/about', {templateUrl: Core.templatePath + 'about.html'}).
            when('/help', {
              redirectTo: '/help/index'
            }).
            when('/help/:topic/', {templateUrl: Core.templatePath + 'help.html'}).
            when('/help/:topic/:subtopic', {templateUrl: Core.templatePath + 'help.html'}).

            otherwise({redirectTo: '/perspective/defaultPage'});
  }]);

  _module.constant('layoutTree', Core.templatePath + 'layoutTree.html');
  _module.constant('layoutFull', Core.templatePath + 'layoutFull.html');

  _module.filter("valueToHtml", () => Core.valueToHtml);
  _module.filter('humanize', () => humanizeValue);
  _module.filter('humanizeMs', () => Core.humanizeMilliseconds);
  _module.filter('maskPassword', () => Core.maskPassword);

  _module.run(["$rootScope", 
               "$routeParams", 
               "jolokia", 
               "workspace", 
               "localStorage", 
               "viewRegistry", 
               "layoutFull", 
               "helpRegistry", 
               "pageTitle", 
               "branding", 
               "toastr", 
               "userDetails", 
               "preferencesRegistry", 
               "postLoginTasks", 
               "preLogoutTasks", 
               ($rootScope,
               $routeParams,
               jolokia,
               workspace,
               localStorage,
               viewRegistry,
               layoutFull,
               helpRegistry,
               pageTitle:Core.PageTitle,
               branding,
               toastr,
               userDetails,
               preferencesRegistry,
               postLoginTasks:Core.Tasks,
               preLogoutTasks:Core.Tasks) => {

    postLoginTasks.addTask("ResetPreLogoutTasks", () => {
      preLogoutTasks.reset();
    });

    preLogoutTasks.addTask("ResetPostLoginTasks", () => {
      postLoginTasks.reset();
    });

    $.support.cors = true;

    /*
      * Count the number of lines in the given text
      */
    $rootScope.lineCount = lineCount;

    /*
      * Easy access to route params
      */
    $rootScope.params = $routeParams;

    /*
      * Wrapper for angular.isArray, isObject, etc checks for use in the view
      *
      * @param type {string} the name of the check (casing sensitive)
      * @param value {string} value to check
      */
    $rootScope.is = function (type:any, value:any):boolean {
      return angular['is' + type](value);
    };

    /*
      * Wrapper for $.isEmptyObject()
      *
      * @param value  {mixed} Value to be tested
      * @return booleanean
      */
    $rootScope.empty = function (value:any):boolean {
      return $.isEmptyObject(value);
    };

    /*
      * Initialize jolokia polling and add handler to change poll
      * frequency
      */
    $rootScope.$on('UpdateRate', (event, rate) => {
      jolokia.stop();
      if (rate > 0) {
        jolokia.start(rate);
      }
      Logger.get("Core").debug("Set update rate to: ", rate);
    });

    $rootScope.$emit('UpdateRate', localStorage['updateRate']);

    /*
      * Debugging Tools
      *
      * Allows you to execute debug functions from the view
      */
      // TODO Doesn't support vargs like it should
    $rootScope.log = function (variable:any):void {
      console.log(variable);
    };
    $rootScope.alert = function (text:string) {
      alert(text);
    };

    viewRegistry['fullscreen'] = layoutFull;
    viewRegistry['notree'] = layoutFull;
    viewRegistry['help'] = layoutFull;
    viewRegistry['welcome'] = layoutFull;
    viewRegistry['preferences'] = layoutFull;
    viewRegistry['about'] = layoutFull;
    viewRegistry['login'] = layoutFull;
    viewRegistry['ui'] = layoutFull;

    helpRegistry.addUserDoc('index', 'app/core/doc/overview.md');
    helpRegistry.addUserDoc('preferences', 'app/core/doc/preferences.md');
    helpRegistry.addSubTopic('index', 'faq', 'app/core/doc/FAQ.md');
    helpRegistry.addSubTopic('index', 'changes', 'app/core/doc/CHANGES.md');
    helpRegistry.addSubTopic('index', 'developer', 'app/core/doc/developer.md');
    helpRegistry.addDevDoc('Core', 'app/core/doc/coreDeveloper.md');
    helpRegistry.addDevDoc('UI', '#/ui/developerPage');
    helpRegistry.addDevDoc('datatable', 'app/datatable/doc/developer.md');
    helpRegistry.addDevDoc('Force Graph', 'app/forcegraph/doc/developer.md');

    preferencesRegistry.addTab("Core", "app/core/html/corePreferences.html");
    preferencesRegistry.addTab("Plugins",
      "app/core/html/pluginPreferences.html");
    preferencesRegistry.addTab("Console Logging",
      "app/core/html/loggingPreferences.html");
    preferencesRegistry.addTab("Editor", "app/ui/html/editorPreferences.html");
    preferencesRegistry.addTab("Jolokia", "app/core/html/jolokiaPreferences.html");
    preferencesRegistry.addTab("Reset", "app/core/html/resetPreferences.html");


    //helpRegistry.discoverHelpFiles(hawtioPluginLoader.getModules());

    toastr.options = {
      'closeButton': true,
      'showMethod': 'slideDown',
      'hideMethod': 'slideUp'
    };

    var throttledError = {
      level: <string>null,
      message: <string>null,
      action: Core.throttled(() => {
        if (throttledError.level === "WARN") {
          notification('warning', throttledError.message);
        }
        if (throttledError.level === "ERROR") {
          notification('error', throttledError.message);
        }

      }, 500)
    };

    window['logInterceptors'].push((level, message) => {
      throttledError.level = level;
      throttledError.message = message;
      throttledError.action();
    });

    setTimeout(() => {
      $("#main-body").fadeIn(2000).after(() => {
        Logger.get("Core").info(branding.appName + " started");
        Core.$apply($rootScope);
        $(window).trigger('resize');
      });
    }, 500);
  }]); // end _module.run
} // end module Core

// bootstrap plugin loader
hawtioPluginLoader.addUrl(Core.url("/plugin"));

// add our module and any dependant third party modules
hawtioPluginLoader.addModule(Core.pluginName);
hawtioPluginLoader.addModule('angularFileUpload');

// register some tasks to run before bootstrap

// add bootstrap style tooltips
hawtioPluginLoader.registerPreBootstrapTask((nextTask) => {
  $("a[title]").tooltip({
    selector: '',
    delay: { show: 1000, hide: 100 }
  });
  nextTask();
});

// Keep the page main container at least the height of the
// viewport
hawtioPluginLoader.registerPreBootstrapTask((nextTask) => {
  Core.adjustHeight();
  $(window).resize(Core.adjustHeight);
  nextTask();
});

// for chrome packaged apps lets enable chrome-extension pages
hawtioPluginLoader.registerPreBootstrapTask((nextTask) => {
  if (Core._module && Core.isChromeApp()) {
    Core._module.config([
      '$compileProvider',
      function ($compileProvider:ng.ICompileProvider) {
        //$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
        $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
        // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
      }
    ]);
  }
  nextTask();
});
