/**
 * @module Core
 */
/// <reference path="corePlugin.ts"/>
/// <reference path="../../perspective/js/perspectiveHelpers.ts"/>
module Core {

  /**
   * Controller that's attached to hawtio's drop-down console, mainly handles the
   * clipboard icon at the bottom-right of the console.
   *
   * @method ConsoleController
   * @for Core
   * @static
   * @param {*} $scope
   * @param {*} $element
   * @param {*} $templateCache
   */
  export var ConsoleController = _module.controller("Core.ConsoleController", ["$scope", "$element", "$templateCache", ($scope, $element, $templateCache) => {

    $scope.setHandler = (clip) => {

      clip.on('mouseDown', function(client, args) {

        // this is apparently a global event handler for zero clipboard
        // so you have to make sure you're handling the right click event
        var icon = $element.find('.icon-copy');
        var icon2 = $element.find('.icon-trash');
        if (this !== icon.get(0) && this !== icon2.get(0)) {
          return;
        }

        if (this == icon.get(0)) {
          copyToClipboard();
        } else {
          clearLogs();
          notification('info', "Cleared logging console");
        }
        Core.$apply($scope);
      });

      function copyToClipboard() {
        var text = $templateCache.get("logClipboardTemplate").lines();
        // remove start/end comment tags
        text.removeAt(0);
        text.removeAt(text.length - 1);
        text.push('<ul>');
        $element.find('#log-panel-statements').children().each(function(index, child:HTMLElement) {
          text.push('  <li>' + child.innerHTML + '</li>');
        });
        text.push('</ul>');
        clip.setText(text.join('\n'));
      }

      function clearLogs() {
        $element.find('#log-panel-statements').children().remove();
      }
    };
  }]);

  /**
   * Outermost controller attached to almost the root of the document, handles
   * logging in and logging out, the PID/container indicator at the bottom right
   * of the window and the document title
   *
   * @method AppController
   * @for Core
   * @static
   * @param {*} $scope
   * @param {ng.ILocationService} $location
   * @param {Core.Workspace} workspace
   * @param {*} jolokiaStatus
   * @param {*} $document
   * @param {Core.PageTitle} pageTitle
   * @param {*} localStorage
   * @param {*} userDetails
   * @param {*} lastLocation
   * @param {*} jolokiaUrl
   * @param {*} branding
   */
  export var AppController = _module.controller("Core.AppController", ["$scope", "$location", "$window", "workspace", "jolokia", "jolokiaStatus", "$document", "pageTitle", "localStorage", "userDetails", "lastLocation", "jolokiaUrl", "branding", "ConnectOptions", "$timeout", "locationChangeStartTasks", "$route", "keycloakContext", ($scope, $location:ng.ILocationService, $window:ng.IWindowService, workspace, jolokia, jolokiaStatus, $document, pageTitle:Core.PageTitle, localStorage, userDetails, lastLocation:{ url:string }, jolokiaUrl, branding, ConnectOptions:Core.ConnectOptions, $timeout:ng.ITimeoutService, locationChangeStartTasks:Core.ParameterizedTasks, $route:ng.route.IRouteService, keycloakContext:Core.KeycloakContext) => {

    $scope.collapse = '';
    $scope.match = null;
    $scope.pageTitle = [];
    $scope.userDetails = userDetails;

    $scope.confirmLogout = false;
    $scope.connectionFailed = false;
    $scope.connectFailure = {};

    $scope.showPrefs = false;
    $scope.keycloakEnabled = keycloakContext.enabled;

    $scope.logoClass = () => {
      if (branding.logoOnly) {
        return "without-text";
      } else {
        return "with-text";
      }
    };

    //$timeout(() => {
    //  if ('showPrefs' in localStorage) {
    //    $scope.showPrefs = Core.parseBooleanValue(localStorage['showPrefs']);
    //  }
    //}, 500);

    $scope.branding = branding;

    //$scope.$watch('showPrefs', (newValue, oldValue) => {
    //  if (newValue !== oldValue) {
    //    localStorage['showPrefs'] = newValue;
    //  }
    //});

    $scope.hasMBeans = () => workspace.hasMBeans();

    $scope.$watch('jolokiaStatus.xhr', function () {
      var failure = jolokiaStatus.xhr;
      $scope.connectionFailed = failure ? true : false;
      $scope.connectFailure.summaryMessage = null;
      if ($scope.connectionFailed) {
        $scope.connectFailure.status = failure.status;
        $scope.connectFailure.statusText = failure.statusText;
        var text = failure.responseText;
        if (text) {
          // lets try parse and return the body contents as HTML
          try {
            var html = $(text);
            var markup = html.find("body");
            if (markup && markup.length) {
              html = markup;
            }
            // lets tone down the size of the headers
            html.each((idx, e) => {
              var name:string = e.localName;
              if (name && name.startsWith("h")) {
                $(e).addClass("ajaxError");
              }
            });
            var container = $("<div></div>");
            container.append(html);
            $scope.connectFailure.summaryMessage = container.html();
            console.log("Found HTML: " + $scope.connectFailure.summaryMessage);
          } catch (e) {
            if (text.indexOf('<') < 0) {
              // lets assume its not html markup if it doesn't have a tag in it
              $scope.connectFailure.summaryMessage = "<p>" + text + "</p>";
            }
          }
        }
      }
    });

    $scope.showPreferences = () => {
      $scope.showPrefs = true;
    };

    $scope.closePreferences = () => {
      $scope.showPrefs = false;
    };

    $scope.confirmConnectionFailed = () => {
      // I guess we should close the window now?
      window.close();
    };

    $scope.setPageTitle = () => {
      $scope.pageTitle = pageTitle.getTitleArrayExcluding([branding.appName]);
      var tab:any = workspace.getActiveTab();
      if (tab && tab.content) {
        setPageTitleWithTab($document, pageTitle, tab.content);
      } else {
        setPageTitle($document, pageTitle);
      }
    };

    $scope.setRegexIndicator = () => {
      try {
        var regexs = angular.fromJson(localStorage['regexs']);
        if (regexs) {
          regexs.reverse().each((regex) => {
            var r = new RegExp(regex.regex, 'g');
            if (r.test($location.absUrl())) {
              $scope.match = {
                name: regex.name,
                color: regex.color
              }
            }
          });
        }
      } catch (e) {
        // ignore
      }
    };

    $scope.loggedIn = () => {
      return userDetails.username !== null && userDetails.username !== 'public';
    };

    $scope.showLogout = () => {
      return $scope.loggedIn();
    };

    $scope.logout = () => {
      $scope.confirmLogout = true;
    };

    $scope.getUsername = () => {
      if (userDetails.username && !userDetails.username.isBlank()) {
        return userDetails.username;
      } else {
        return 'user';
      }
    };

    $scope.doLogout = () => {
      $scope.confirmLogout = false;
      Core.logout(jolokiaUrl, userDetails, localStorage, $scope);
    };

    $scope.$watch(() => { return localStorage['regexs'] }, $scope.setRegexIndicator);

    $scope.reloaded = false;

    $scope.maybeRedirect = () => {
      if (userDetails.username === null) {
        var currentUrl = $location.url();
        if (!currentUrl.startsWith('/login')) {
          lastLocation.url = currentUrl;
          $location.url('/login');
        } else {
          // ensures that the login page loads correctly if the user happens to click refresh
          if (!$scope.reloaded) {
            $route.reload();
            $scope.reloaded = true;
          }
        }
      } else {
        if ($location.url().startsWith('/login')) {
          var url:string = defaultPage();
          if (angular.isDefined(lastLocation.url)) {
            url = lastLocation.url;
          }
          $location.url(url);
        }
      }
    };

    $scope.$watch('userDetails', (newValue, oldValue) => {
      $scope.maybeRedirect();
    }, true);

    $scope.$on('hawtioOpenPrefs', () => {
      $scope.showPrefs = true;
    });

    $scope.$on('hawtioClosePrefs', () => {
      $scope.showPrefs = false;
    });

    $scope.$on('$routeChangeStart', (event, args) => {
      if ( (!args || !args.params || !args.params.pref) && $scope.showPrefs) {
        $scope.showPrefs = false;
      }
      $scope.maybeRedirect();
    });

    $scope.$on('$routeChangeSuccess', () => {
      $scope.setPageTitle($document, PageTitle);
      $scope.maybeRedirect();
    });

    $scope.fullScreen = () => {
      if ($location.path().startsWith("/login")) {
        return branding.fullscreenLogin;
      }
      var tab = $location.search()['tab'];
      if (tab) {
        return tab === "fullscreen";
      }
      return false;
    };

    $scope.login = () => {
      return $location.path().startsWith("/login");
    };

    function defaultPage() {
      return Perspective.defaultPage($location, workspace, jolokia, localStorage);
    }

    $scope.redirectToKeycloakAccountMgmt = () => {
      keycloakContext.keycloak.accountManagement();
    };

    $scope.redirectToKeycloakAdminConsole = () => {
      var realm: string = encodeURIComponent(keycloakContext.keycloak.realm);
      var redirectURI: string = keycloakContext.keycloak.authServerUrl + '/admin/' + realm + '/console/index.html';
      $window.location.href = redirectURI;
    };

  }]);

}
