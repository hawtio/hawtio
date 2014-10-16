/// <reference path="../../baseIncludes.ts"/>
/// <reference path="../../baseHelpers.ts"/>
/// <reference path="../../helpers/js/pluginHelpers.ts"/>
/// <reference path="../../helpers/js/urlHelpers.ts"/>
/// <reference path="../../core/js/workspace.ts"/>
/// <reference path="../../core/js/coreHelpers.ts"/>
/// <reference path="dockerRegistryInterfaces.ts"/>

module DockerRegistry {
  export var context = '/docker-registry';
  export var hash = UrlHelpers.join('#', context);
  export var defaultRoute = UrlHelpers.join(hash, 'list');
  export var basePath = UrlHelpers.join('app', context);
  export var templatePath = UrlHelpers.join(basePath, 'html');
  export var pluginName = 'DockerRegistry';
  export var log:Logging.Logger = Logger.get(pluginName);
  export var SEARCH_FRAGMENT = '/v1/search';

  /**
   * Fetch the available docker images in the registry, can only
   * be called after app initialization
   */
  export function getDockerImageRepositories(callback: (restURL:string, repositories:DockerImageRepositories) => void) {
    var DockerRegistryRestURL = Core.injector.get("DockerRegistryRestURL");
    var $http:ng.IHttpService = Core.injector.get("$http");
    DockerRegistryRestURL.then((restURL:string) => {
      $http.get(UrlHelpers.join(restURL, SEARCH_FRAGMENT))
        .success((data:DockerImageRepositories) => {
          callback(restURL, data);
        })
        .error((data) => {
          log.debug("Error fetching image repositories:", data);
          callback(restURL, null);
        });
    });
  }


}
