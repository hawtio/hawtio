module Core {

  export function ConsoleController($scope, $element, $templateCache) {

    $scope.setHandler = (clip) => {

      clip.addEventListener('mouseDown', function(client, args) {


        // this is apparently a global event handler for zero clipboard
        // so you have to make sure you're handling the right click event
        var icon = $element.find('.icon-copy');
        if (this !== icon.get(0)) {
          return;
        }

        var text = $templateCache.get("logClipboardTemplate").lines();
        text.removeAt(0);
        text.removeAt(text.length - 1);
        $element.find('#log-panel-statements').children().each(function(index, child) {
          text.push('  <li>' + child.innerHTML + '</li>');
        });
        text.push('</ul>');
        clip.setText(text.join('\n'));
        Core.$apply($scope);
      });
    };

  }

  export function AppController($scope, $location, workspace, jolokiaStatus, $document, pageTitle:Core.PageTitle, localStorage, userDetails, lastLocation, jolokiaUrl, branding) {

    if (userDetails.username === null) {
      $location.url('/help');
    }

    $scope.collapse = '';
    $scope.match = null;
    $scope.pageTitle = [];
    $scope.userDetails = userDetails;
    $scope.confirmLogout = false;
    $scope.connectionFailed = false;
    $scope.connectFailure = {};

    $scope.appName = branding.appName;
    $scope.appLogo = branding.appLogo;

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
              var name = e.localName;
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

    $scope.confirmConnectionFailed = () => {
      // I guess we should close the window now?
      window.close();
    };

    $scope.setPageTitle = () => {
      $scope.pageTitle = pageTitle.getTitleArrayExcluding([branding.appName]);
      var tab = workspace.getActiveTab();
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
      return $scope.loggedIn() && angular.isDefined(userDetails.loginDetails);
    }

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
      logout(jolokiaUrl, userDetails, localStorage, $scope);
    };

    $scope.$watch(() => { return localStorage['regexs'] }, $scope.setRegexIndicator);

    $scope.maybeRedirect = () => {
      if (userDetails.username === null) {
        var currentUrl = $location.url();
        if (!currentUrl.startsWith('/login')) {
          lastLocation.url = currentUrl;
          $location.url('/login');
        }
      } else {
        if ($location.url().startsWith('/login')) {
          var url:Object = '/help';
          if (angular.isDefined(lastLocation.url)) {
            url = lastLocation.url;
          }
          $location.url(url);
        }
      }
    }

    $scope.$watch('userDetails', (newValue, oldValue) => {
      $scope.maybeRedirect();
    }, true);

    $scope.$on('$routeChangeStart', function() {
      $scope.maybeRedirect();
    });

    $scope.$on('$routeChangeSuccess', function() {
      $scope.setPageTitle();
      $scope.setRegexIndicator();
    });

    $scope.fullScreen = () => {
      if ($location.url().startsWith("/login")) {
        return branding.fullscreenLogin;
      }
      var tab = $location.search()['tab'];
      if (tab) {
        return tab === "fullscreen";
      }
      return false;
    }

    $scope.login = () => {
      return $location.url().startsWith("/login");
    }

  }

}
