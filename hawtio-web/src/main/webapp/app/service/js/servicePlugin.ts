/// <reference path="../../baseIncludes.ts"/>
/// <reference path="serviceHelpers.ts"/>
/// <reference path="../../helpers/js/pollHelpers.ts"/>
/// <reference path="../../helpers/js/arrayHelpers.ts"/>

module Service {

  var isKubernetes = false;

  export interface SelectorMap {
    [name:string]: string
  }
  export interface Service {
    kind: string;
    id: string;
    portalIP: string;
    selector?: SelectorMap;
    port: number;
    containerPort: number;
  }
  export interface ServiceResponse {
    items: Array<Service>;
  }
  export var _module = angular.module(pluginName, ['hawtioCore']);
  _module.factory("ServiceRegistry", ['$http', '$rootScope', 'workspace', ($http:ng.IHttpService, $rootScope:ng.IRootScopeService, workspace) => {
    var self:any = {
      name: 'ServiceRegistry',
      services: [],
      fetch: (next: () => void) => {
        if (isKubernetes) {
          $http({
            method: 'GET',
            url: 'service'
          }).success((data, status, headers, config) => {
            self.onSuccessfulPoll(next, data, status, headers, config);

          }).error((data, status, headers, config) => {
            self.onFailedPoll(next, data, status, headers, config);
          })
        }
      },
      onSuccessfulPoll: (next: () => void, data:ServiceResponse, status, headers: (name: string) => string, config) => {
        var triggerUpdate = ArrayHelpers.sync(self.services, data.items);
        if (triggerUpdate) {
          log.debug("Services updated: ", self.services);
          Core.$apply($rootScope);
        }
        next();

      },
      onFailedPoll: (next: () => void, data, status, headers: (name: string) => string, config) => {
        log.debug("Failed poll, data: ", data, " status: ", status);
        next();
      }
    };
    return self;
  }]);
  _module.run(['ServiceRegistry', '$timeout', 'jolokia', (ServiceRegistry, $timeout:ng.ITimeoutService, jolokia:Jolokia.IJolokia) => {
    ServiceRegistry.go = PollHelpers.setupPolling(ServiceRegistry, (next: () => void) => {
      ServiceRegistry.fetch(next);
    }, 2000, $timeout, jolokia);
    ServiceRegistry.go();
    log.debug("Loaded");
  }]);
  hawtioPluginLoader.addModule(pluginName);
}
