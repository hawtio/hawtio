/**
 * @module Core
 */

/// <reference path="../../baseHelpers.ts"/>
/// <reference path="coreHelpers.ts"/>
/// <reference path="corePlugin.ts"/>
module Core {

  _module.service('localStorage',() => {
    return Core.getLocalStorage();
  });

  _module.factory('pageTitle', () => {
    var answer = new Core.PageTitle();
    return answer;
  });

  _module.factory('viewRegistry',() => {
    return {};
  });

  _module.factory('lastLocation', () => {
    return {};
  });

  _module.factory('postLoginTasks', () => {
    return Core.postLoginTasks;
  });

  _module.factory('preLogoutTasks', () => {
    return Core.preLogoutTasks;
  });

  _module.factory('helpRegistry', ["$rootScope", ($rootScope) => {
    return new Core.HelpRegistry($rootScope);
  }]);

  _module.factory('preferencesRegistry', () => {
    return new Core.PreferencesRegistry();
  });

  _module.factory('toastr', ["$window", ($window) => {
    var answer: any = $window.toastr;
    if (!answer) {
      // lets avoid any NPEs
      answer = {};
      $window.toaster = answer;
    }
    return answer;
  }]);

  _module.factory('xml2json', () => {
    var jquery:any = $;
    return jquery.xml2json;
  });

}
