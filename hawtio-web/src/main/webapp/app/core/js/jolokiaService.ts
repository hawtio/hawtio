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

      if (connectionOptions) {
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

      if (username && password) {
        userDetails.username = username;
        userDetails.password = password;

        $.ajaxSetup({
          beforeSend: (xhr) => {
            xhr.setRequestHeader('Authorization', Core.getBasicAuthHeader(<string>userDetails.username, <string>userDetails.password));
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
          delete userDetails.loginDetails;
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
