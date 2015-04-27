/// <reference path="../../kubernetes/js/kubernetesHelpers.ts"/>
/// <reference path="dockerRegistryHelpers.ts"/>
module DockerRegistry {

  export var _module = angular.module(pluginName, ['hawtioCore', 'ngResource']);
  export var controller = PluginHelpers.createControllerFunction(_module, pluginName);
  export var route = PluginHelpers.createRoutingFunction(templatePath);

  _module.config(['$routeProvider', ($routeProvider:ng.route.IRouteProvider) => {
    $routeProvider.when(UrlHelpers.join(context, 'list'), route('list.html', false));
  }]);

  _module.factory('DockerRegistryRestURL', ['jolokiaUrl', 'jolokia', '$q', '$rootScope', (jolokiaUrl:string, jolokia:Jolokia.IJolokia, $q:ng.IQService, $rootScope:ng.IRootScopeService) => {
    var answer = <ng.IDeferred<string>> $q.defer();
    jolokia.getAttribute(Kubernetes.managerMBean, 'DockerRegistry', undefined, 
      <Jolokia.IParams> onSuccess((response) => {
        var proxified = UrlHelpers.maybeProxy(jolokiaUrl, response);
        log.debug("Discovered docker registry API URL: " , proxified);
        answer.resolve(proxified);
        Core.$apply($rootScope);
      }, {
        error: (response) => {
          log.debug("error fetching docker registry API details: ", response);
          answer.reject(response);
          Core.$apply($rootScope);
        }
      }));
    return answer.promise;
  }]);

  _module.run(['viewRegistry', 'workspace', (viewRegistry, workspace:Core.Workspace) => {
    log.debug("Running");
    viewRegistry['docker-registry'] = UrlHelpers.join(templatePath, 'layoutDockerRegistry.html');
    workspace.topLevelTabs.push({
      id: 'docker-registry',
      content: 'Images',
      isValid: (workspace:Core.Workspace) => workspace.treeContainsDomainAndProperties(Fabric.jmxDomain, { type: 'KubernetesManager' }),
      isActive: (workspace:Core.Workspace) => workspace.isLinkActive('docker-registry'),
      href: () => defaultRoute
    });
  }]);

  hawtioPluginLoader.addModule(pluginName);

}

