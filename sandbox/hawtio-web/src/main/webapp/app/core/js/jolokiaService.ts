/**
 * @module Core
 */
/// <reference path="corePlugin.ts"/>
/// <reference path="coreInterfaces.ts"/>
module Core {

  export interface DummyJolokia extends Jolokia.IJolokia {
    running:boolean;
  }

  _module.factory('jolokia',["$location", "localStorage", "jolokiaStatus", "$rootScope", "userDetails", "jolokiaParams", "jolokiaUrl", ($location:ng.ILocationService, localStorage, jolokiaStatus, $rootScope, userDetails:Core.UserDetails, jolokiaParams, jolokiaUrl):Jolokia.IJolokia => {
    // TODO - Maybe have separate URLs or even jolokia instances for loading plugins vs. application stuff
    // var jolokiaUrl = $location.search()['url'] || Core.url("/jolokia");
    log.debug("Jolokia URL is " + jolokiaUrl);
    if (jolokiaUrl) {

      var connectionName = Core.getConnectionNameParameter($location.search());
      var connectionOptions = Core.getConnectOptions(connectionName);

      // pass basic auth credentials down to jolokia if set
      var username:String = null;
      var password:String = null;

      // found will be true, when we are connecting to remote jolokia
      // in this case, there are two different credentials - one used to connect to host hawtio (which may not require authentication)
      // and second - to connect to remote jolokia via /jvm/connect
      var found = false;

      // search for passed credentials when connecting to remote server
      try {
        if (window.opener && "passUserDetails" in window.opener) {
          // these are credentials used to connect to remote jolokia
          username = window.opener["passUserDetails"].username;
          password = window.opener["passUserDetails"].password;
          found = true;
        }
      } catch (securityException) {
        // ignore
      }

      if (!found) {
        if (connectionOptions && connectionOptions.userName && connectionOptions.password) {
          username = connectionOptions.userName;
          password = connectionOptions.password;
        } else if (angular.isDefined(userDetails) &&
                    angular.isDefined(userDetails.username) &&
                    angular.isDefined(userDetails.password)) {
          username = userDetails.username;
          password = userDetails.password;
        } else {
          // lets see if they are passed in via request parameter...
          var search = hawtioPluginLoader.parseQueryString();
          username = search["_user"];
          password = search["_pwd"];
          if (angular.isArray(username)) username = username[0];
          if (angular.isArray(password)) password = password[0];
        }
      } else {
        // we have case when passed (from window.opener) credentials will be used for Jolokia access
        userDetails.remoteJolokiaUserDetails = {
          username: username,
          password: password
        }
      }

      if (username && password) {
        userDetails.username = username;
        userDetails.password = password;

        $.ajaxSetup({
          beforeSend: (xhr) => {
            xhr.setRequestHeader('Authorization', Core.getBasicAuthHeader(<string>username, <string>password));
          }
        });

        var loginUrl = jolokiaUrl.replace("jolokia", "auth/login/");
        $.ajax(loginUrl, {
          type: "POST",
          async: false, // ugly ugly ugly and soon, deprecated...
          success: (response) => {
            jolokiaStatus.xhr = null;
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
            jolokiaStatus.xhr = xhr;
            // silently ignore, we could be using the proxy
            Core.executePostLoginTasks();
          }
        });

      }

      jolokiaParams['ajaxError'] = (xhr, textStatus, error) => {
        if (xhr.status === 401 || xhr.status === 403) {
          // logged out
          Core.executePreLogoutTasks(() => {
            if (localStorage['jvmConnect'] && localStorage['jvmConnect'] != "undefined") {
              var jvmConnect = angular.fromJson(localStorage['jvmConnect'])
              _.each(jvmConnect, function(value) {
                delete value['userName'];
                delete value['password'];
              });
              localStorage.setItem('jvmConnect', angular.toJson(jvmConnect));
            }
            localStorage.removeItem('activemqUserName');
            localStorage.removeItem('activemqPassword');

            Core.executePostLogoutTasks(() => {
              log.debug("Executing logout callback after successfully executed postLogoutTasks");
              userDetails.username = null;
              userDetails.password = null;
              userDetails.loginDetails = null;
              userDetails.remoteJolokiaUserDetails = null;
              delete localStorage['userDetails'];
            });
          });
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

      // let's check if we can call faster jolokia.list()
      Core.checkJolokiaOptimization(jolokia, jolokiaStatus);

      return jolokia;
    } else {

      var answer = <DummyJolokia> {
        running: false,
        request: (req:any, opts?:Jolokia.IParams) => null,
        register: (req:any, opts?:Jolokia.IParams) => <number>null,
        list: (path, opts?) => null,
        search: (mBeanPatter, opts?) => null,
        getAttribute: (mbean, attribute, path?, opts?) => null,
        setAttribute: (mbean, attribute, value, path?, opts?) => {},
        version: (opts?) => <Jolokia.IVersion>null,
        execute: (mbean, operation, ...args) => null,
        start: (period) => {
          answer.running = true;
        },
        stop: () => {
          answer.running = false;
        },
        isRunning: () => answer.running,
        jobs: () => []

      };

      // empty jolokia that returns nothing
      return answer;          
    }
  }]);

}
