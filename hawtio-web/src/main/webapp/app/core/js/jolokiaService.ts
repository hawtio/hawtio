/**
 * @module Core
 */
/// <reference path="corePlugin.ts"/>
module Core {

  _module.factory('jolokia',["$location", "localStorage", "jolokiaStatus", "$rootScope", "userDetails", "jolokiaParams", ($location:ng.ILocationService, localStorage, jolokiaStatus, $rootScope, userDetails, jolokiaParams) => {
    // TODO - Maybe have separate URLs or even jolokia instances for loading plugins vs. application stuff
    // var jolokiaUrl = $location.search()['url'] || url("/jolokia");
    log.debug("Jolokia URL is " + jolokiaUrl);
    if (jolokiaUrl) {

      var credentials = hawtioPluginLoader.getCredentials(jolokiaUrl);
      // pass basic auth credentials down to jolokia if set
      var username = null;
      var password = null;

      //var userDetails = angular.fromJson(localStorage[jolokiaUrl]);

      if (credentials.length === 2) {
        username = credentials[0];
        password = credentials[1];

        // TODO we should try avoid both permutations of username / userName :)

      } else if (angular.isDefined(userDetails) &&
                  angular.isDefined(userDetails.username) &&
                  angular.isDefined(userDetails.password)) {

        username = userDetails.username;
        password = userDetails.password;

      } else if (angular.isDefined(userDetails) &&
                  angular.isDefined(userDetails.userName) &&
                  angular.isDefined(userDetails.password)) {

        username = userDetails.userName;
        password = userDetails.password;

      } else {
        // lets see if they are passed in via request parameter...
        var search = hawtioPluginLoader.parseQueryString();
        username = search["_user"];
        password = search["_pwd"];
        if (angular.isArray(username)) username = username[0];
        if (angular.isArray(password)) password = password[0];
      }

      if (username && password) {

        /*
        TODO can't use this, sets the username/password in the URL on every request, plus jolokia passes them on to $.ajax() which causes a fatal exception in firefox
        jolokiaParams['username'] = username;
        jolokiaParams['password'] = password;
        */

        //console.log("Using user / pwd " + username + " / " + password);

        userDetails.username = username;
        userDetails.password = password;

        $.ajaxSetup({
          beforeSend: (xhr) => {
            xhr.setRequestHeader('Authorization', Core.getBasicAuthHeader(userDetails.username, userDetails.password));
          }
        });

        var loginUrl = jolokiaUrl.replace("jolokia", "auth/login/");
        $.ajax(loginUrl, {
          type: "POST",
          success: (response) => {
            if (response['credentials'] || response['principals']) {
              userDetails.loginDetails = {
                'credentials': response['credentials'],
                'principals': response['principals']
              };
            } else {
              var doc = Core.pathGet(response, ['children', 0, 'innerHTML']);
                // hmm, maybe we got an XML document, let's log it just in case...
                if (doc) {
                  Core.log.debug("Response is a document (ignoring this): ", doc);
                }
            }
            Core.executePostLoginTasks();
          },
          error: (xhr, textStatus, error) => {
            // silently ignore, we could be using the proxy
            Core.executePostLoginTasks();
          }
        });

      }

      jolokiaParams['ajaxError'] = (xhr, textStatus, error) => {
        if (xhr.status === 401 || xhr.status === 403) {
          userDetails.username = null;
          userDetails.password = null;
        } else {
          jolokiaStatus.xhr = xhr;
          if (!xhr.responseText && error) {
            xhr.responseText = error.stack;
          }
        }
        Core.$apply($rootScope);
      };

      var jolokia = new Jolokia(jolokiaParams);
      localStorage['url'] = jolokiaUrl;
      jolokia.stop();
      return jolokia;
    } else {

      var answer = {
        running: false,
        request: () => null,
        register: () => null,
        list: () => null,
        search: () => null,
        read: () => null,
        execute: () => null,

        start: () => {
          answer.running = true;
          return null;
        },
        stop: () => {
          answer.running = false;
          return null;
        },
        isRunning: () => answer.running,
        jobs: () => []

      };

      // empty jolokia that returns nothing
      return answer;          
    }
  }]);

}
