var SamplePlugin = (function (SamplePlugin) {

  SamplePlugin.pluginName = 'sample-plugin';
  SamplePlugin.log = Logger.get('sample-plugin');

  SamplePlugin.module = angular.module(SamplePlugin.pluginName, [])
    .config(configureRoutes)
    .run(configureHelp)
    .run(configureLayout)
    .run(initPlugin)
    .component('samplePlugin', {
      template: `
        <div class="sample-controller">
          <div class="row-fluid">
            <div class="span6 offset3">
              <h2>Sample Plugin</h2>
              <p>{{$ctrl.message}}</p>
            </div>
          </div>
        </div>`,
      controller: SamplePluginController
    });

  function configureRoutes($routeProvider) {
    $routeProvider
      .when('/sample-plugin', { template: '<sample-plugin></sample-plugin>' })
  }
  configureRoutes.$inject = ['$routeProvider'];

  function configureHelp(helpRegistry, $templateCache) {
    var path = 'plugin/help.md';
    helpRegistry.addUserDoc('Sample Plugin', path);
    $templateCache.put(path, `
## Spring Boot Sample plugin
Help documentation for Spring Boot Sample plugin.
    `);
  }
  configureHelp.$inject = ['helpRegistry', '$templateCache'];

  function configureLayout(mainNavService) {
    // set rank = -10 to make sure the item is placed at the bottom
    mainNavService.addItem({
      title: 'Sample Plugin',
      href: '/sample-plugin',
      isValid: function () { return true; },
      rank: -10
    });
  }
  configureLayout.$inject = ['mainNavService'];

  function initPlugin() {
    SamplePlugin.log.info(SamplePlugin.pluginName, "loaded");
  }
  initPlugin.$inject = [];

  function SamplePluginController($scope, jolokia) {
    this.message = "Hello world!";
  }
  SamplePluginController.$inject = ['$scope', 'jolokia'];

  return SamplePlugin;

})(SamplePlugin || {});

hawtioPluginLoader.addModule(SamplePlugin.pluginName);
