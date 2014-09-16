/// <reference path="../../baseIncludes.ts"/>
/// <reference path="../../helpers/js/pluginHelpers.ts"/>
/// <reference path="../../core/js/workspace.ts"/>
/// <reference path="../../fabric/js/fabricGlobals.ts"/>

module Kubernetes {
  export var objectName = Fabric.jmxDomain + ":type=Kubernetes";
  export var context = '/fabric/kubernetes';
  export var hash = '#' + context;
  export var defaultRoute = hash + '/pods';
  export var pluginName = 'Kubernetes';
  export var templatePath = 'app/kubernetes/html/';
  export var log:Logging.Logger = Logger.get(pluginName);
  export var _module = angular.module(pluginName, ['hawtioCore', 'ngResource']);
  export var controller = PluginHelpers.createControllerFunction(_module, pluginName);
  export var route = PluginHelpers.createRoutingFunction(templatePath);

  _module.config(['$routeProvider', ($routeProvider:ng.route.IRouteProvider) => {
    $routeProvider.when(UrlHelpers.join(context, 'pods'), route('pods.html'));
  }]);

  // set up a promise that supplies the API URL for Kubernetes, proxied if necessary
  _module.factory('KubernetesApiURL', ['jolokiaUrl', 'jolokia', '$q', '$rootScope', (jolokiaUrl:string, jolokia:Jolokia.IJolokia, $q:ng.IQService, $rootScope:ng.IRootScopeService) => {
    var answer = <ng.IDeferred<string>>$q.defer();
    jolokia.getAttribute(objectName, 'KubernetesAddress', undefined, 
      <Jolokia.IParams> onSuccess((response) => {
        var proxified = UrlHelpers.maybeProxy(jolokiaUrl, response);
        log.debug("discovered API URL:", proxified);
        answer.resolve(proxified);
        Core.$apply($rootScope);
      }, {
        error: (response) => {
          log.debug("error fetching API URL: ", response);
          answer.reject(response);
          Core.$apply($rootScope);
        }
      }));
    return answer.promise;
  }]);

  _module.factory('KubernetesPods', ['KubernetesApiURL', '$q', '$resource', '$rootScope', (KubernetesApiURL:ng.IPromise<string>, $q:ng.IQService, $resource:ng.resource.IResourceService, $rootScope:ng.IRootScopeService) => {
    var answer = <ng.IDeferred<ng.resource.IResourceClass>>$q.defer();
    KubernetesApiURL.then((KubernetesApiURL) => {
      var url = KubernetesApiURL;
      if (url.startsWith('proxy')) {
        url = KubernetesApiURL.replace(/:/g, '\\:');
      } else {
        url = KubernetesApiURL.replace(/:([^\/])/, '\\:');
      }
      log.debug("resource URL: ", url);
      var resource = $resource(UrlHelpers.join(url, '/api/v1beta1/pods/:id'), null, {
        'query': {
          method: 'GET',
          isArray: false
        }
      });
      answer.resolve(resource);
      Core.$apply($rootScope);
    }, (response) => {
      log.debug("Failed to get rest API URL, can't create pods resource: ", response);
      answer.reject(response);
      Core.$apply($rootScope);
    });
    return answer.promise;
  }]);

  _module.run(['viewRegistry', 'workspace', (viewRegistry, workspace:Core.Workspace) => {
    log.debug("Running");
    viewRegistry['fabric/kubernetes'] = templatePath + 'layoutKubernetes.html';
    workspace.topLevelTabs.push({
      id: 'fabric.kubernetes',
      content: 'Kubernetes',
      isValid: (workspace:Core.Workspace) => workspace.treeContainsDomainAndProperties(Fabric.jmxDomain, { type: 'Kubernetes' }),
      isActive: (workspace:Core.Workspace) => workspace.isLinkActive('fabric/kubernetes'),
      href: () => defaultRoute
    });
  }]);

  hawtioPluginLoader.addModule(pluginName);
}
