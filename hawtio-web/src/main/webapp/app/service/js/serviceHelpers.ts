/// <reference path="../../baseIncludes.ts"/>

module Service {

  export var pluginName = 'Service';
  export var log:Logging.Logger = Logger.get(pluginName);

  /**
   * Returns true if there is a service available for the given ID or false
   */
  export function hasService(ServiceRegistry, serviceName: string) {
    if (!ServiceRegistry || !serviceName) {
      return false;
    }
    var answer = false;
    angular.forEach(ServiceRegistry.services, (service) => {
      if (serviceName === service.id) {
        answer = true;
      }
    });
    return answer;
  }

  /**
   * Returns the service for the given service name (ID) or null if it cannot be found
   *
   * @param ServiceRegistry
   * @param serviceName
   * @return {null}
   */
  export function findService(ServiceRegistry, serviceName: string) {
    var answer = null;
    if (ServiceRegistry && serviceName) {
      angular.forEach(ServiceRegistry.services, (service) => {
        if (serviceName === service.id) {
          answer = service;
        }
      });
    }
    return answer;
  }
}
