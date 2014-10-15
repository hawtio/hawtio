/// <reference path="../../baseIncludes.ts"/>
/// <reference path="../../helpers/js/pluginHelpers.ts"/>
/// <reference path="../../core/js/workspace.ts"/>
/// <reference path="../../fabric/js/fabricGlobals.ts"/>
/// <reference path="kubernetesHelpers.ts"/>
module Kubernetes {

  export var objectName = Fabric.jmxDomain + ":type=Kubernetes";
  export var context = '/kubernetes';
  export var hash = '#' + context;
  export var defaultRoute = hash + '/pods';
  export var pluginName = 'Kubernetes';
  export var templatePath = 'app/kubernetes/html/';
  export var log:Logging.Logger = Logger.get(pluginName);
  export var _module = angular.module(pluginName, ['hawtioCore', 'ngResource']);
  export var controller = PluginHelpers.createControllerFunction(_module, pluginName);
  export var route = PluginHelpers.createRoutingFunction(templatePath);

  _module.config(['$routeProvider', ($routeProvider:ng.route.IRouteProvider) => {
    $routeProvider.when(UrlHelpers.join(context, 'pods'), route('pods.html', false))
                  .when(UrlHelpers.join(context, 'replicationControllers'), route('replicationControllers.html', false))
                  .when(UrlHelpers.join(context, 'services'), route('services.html', false));
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

  function createResource(deferred:ng.IDeferred<ng.resource.IResourceClass>, thing:string, urlTemplate:string) {
    var $rootScope = <ng.IRootScopeService> Core.injector.get("$rootScope");
    var $resource = <ng.resource.IResourceService> Core.injector.get("$resource");
    var KubernetesApiURL = <ng.IPromise<string>> Core.injector.get("KubernetesApiURL");

    KubernetesApiURL.then((KubernetesApiURL) => {
      var url = UrlHelpers.escapeColons(KubernetesApiURL);
      log.debug("Url for ", thing, ": ", url);
      var resource = $resource(UrlHelpers.join(url, urlTemplate), null, {
        query: { method: 'GET', isArray: false },
        save: { method: 'PUT', params: { id: '@id' } }
      });
      deferred.resolve(resource);
      Core.$apply($rootScope);
    }, (response) => {
      log.debug("Failed to get rest API URL, can't create " + thing + " resource: ", response);
      deferred.reject(response);
      Core.$apply($rootScope);
    });
  }

  _module.factory('KubernetesVersion', ['$q', ($q:ng.IQService) => {
    var answer = <ng.IDeferred<ng.resource.IResourceClass>> $q.defer();
    createResource(answer, 'pods', '/version');
    return answer.promise;
  }]);

  _module.factory('KubernetesPods', ['$q', ($q:ng.IQService) => {
    var answer = <ng.IDeferred<ng.resource.IResourceClass>>$q.defer();
    createResource(answer, 'pods', '/api/v1beta1/pods/:id');
    return answer.promise;
  }]);

  _module.factory('KubernetesReplicationControllers', ['$q', ($q:ng.IQService) => {
    var answer = <ng.IDeferred<ng.resource.IResourceClass>>$q.defer();
    createResource(answer, 'replication controllers', '/api/v1beta1/replicationControllers/:id');
    return answer.promise;
  }]);

  _module.factory('KubernetesServices', ['$q', ($q:ng.IQService) => {
    var answer = <ng.IDeferred<ng.resource.IResourceClass>>$q.defer();
    createResource(answer, 'services', '/api/v1beta1/services/:id');
    return answer.promise;
  }]);

  _module.run(['viewRegistry', 'workspace', (viewRegistry, workspace:Core.Workspace) => {
    log.debug("Running");
    viewRegistry['kubernetes'] = templatePath + 'layoutKubernetes.html';
    workspace.topLevelTabs.push({
      id: 'kubernetes',
      content: 'Kubernetes',
      isValid: (workspace:Core.Workspace) => workspace.treeContainsDomainAndProperties(Fabric.jmxDomain, { type: 'Kubernetes' }),
      isActive: (workspace:Core.Workspace) => workspace.isLinkActive('kubernetes'),
      href: () => defaultRoute
    });
  }]);

  hawtioPluginLoader.addModule(pluginName);
}
