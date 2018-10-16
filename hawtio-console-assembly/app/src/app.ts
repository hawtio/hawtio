/// <reference path="login/login.module.ts"/>

namespace ConsoleAssembly {

  const pluginName = 'hawtio-console-assembly';
  const log: Logging.Logger = Logger.get(pluginName);

  angular
    .module(pluginName, [
      Login.loginModule
    ])
    .run(refreshUserSessionWhenLocationChanges)
    .run(configureAbout);

  function refreshUserSessionWhenLocationChanges(
    locationChangeStartTasks: Core.ParameterizedTasks,
    $http: ng.IHttpService): void {
    'ngInject';
    locationChangeStartTasks.addTask('RefreshUserSession',
      ($event: ng.IAngularEvent, newUrl: string, oldUrl: string): void => {
        $http({
          method: 'post',
          url: 'refresh'
        }).then((response) => {
          log.debug("Updated session. Response:", response);
        }).catch((response) => {
          log.debug("Failed to update session expiry. Response:", response);
        });
      });
  }

  function configureAbout(aboutService: About.AboutService, jolokiaService: JVM.JolokiaService): void {
    jolokiaService.getAttribute('hawtio:type=About', 'HawtioVersion')
      .then(hawtioVersion => aboutService.addProductInfo('Hawtio', hawtioVersion));
  }

  hawtioPluginLoader.addModule(pluginName);

}
