/**
 * @module Core
 */
/// <reference path="../../helpers/js/stringHelpers.ts"/>
/// <reference path="../../helpers/js/urlHelpers.ts"/>
/// <reference path="corePlugin.ts"/>
/// <reference path="coreInterfaces.ts"/>
module Core {

  export interface DummyJolokia extends Jolokia.IJolokia {
    running:boolean;
  }

  _module.factory('jolokia',["$location", "localStorage", "jolokiaStatus", "$rootScope", "userDetails", "jolokiaParams", "jolokiaUrl", ($location:ng.ILocationService, localStorage, jolokiaStatus, $rootScope, userDetails:Core.UserDetails, jolokiaParams, jolokiaUrl):Jolokia.IJolokia => {
    // TODO - Maybe have separate URLs or even jolokia instances for loading plugins vs. application stuff
    // var jolokiaUrl = $location.search()['url'] || Core.url("/jolokia");
    log.debug("Creating jolokia service, URL is: ", jolokiaUrl);
    if (jolokiaUrl) {
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
      // empty jolokia that returns nothing
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
      return answer;          
    }
  }]);

}
