/**
 * The main entry point for the Simple module
 */
var Simple = (function (Simple) {

  /**
   * The name of this plugin
   */
  Simple.pluginName = 'simple-plugin';

  /**
   * This plugin's logger instance
   */
  Simple.log = Logger.get('simple-plugin');

  /**
   * The top level path of this plugin on the server
   */
  Simple.contextPath = "/simple-plugin/";

  /**
   * This plugin's AngularJS module instance.
   * Typically a plugin AngularJS module should be configured
   * in the following 5 steps:
   * 
   * 1. Configure routes
   * 2. Configure help doc
   * 3. Configure navigation menus
   * 4. Run any initialisation tasks (if required)
   * 5. Set up components (= template + controller)
   */
  Simple.module = angular.module(Simple.pluginName, [])
    .config(configureRoutes)
    .run(configureHelp)
    .run(configureLayout)
    .run(initPlugin)
    .component('simple', {
      template: `
        <div class="simple-controller">
          <div class="row-fluid">
            <div class="span6 offset3">
              <h2>Simple plugin example</h2>
              <h3>{{$ctrl.hello}}</h3>
              <div class="cpu-display alert alert-info">
                <span class="pficon pficon-info"></span>
                CPU Load: {{$ctrl.cpuLoad | number:3}}
              </div>
              <p>This is an example of a very simple Hawtio plugin that's discovered via JMX using Jolokia.</p>
            </div>
          </div>
        </div>`,
      controller: SimpleController
    });

  /**
   * Here we define the route for our plugin. One note is
   * to avoid using 'otherwise', as Hawtio has a handler
   * in place when a route doesn't match any routes that
   * routeProvider has been configured with.
   */
  function configureRoutes($routeProvider) {
    $routeProvider
      .when('/simple', { template: '<simple></simple>' })
  }
  configureRoutes.$inject = ['$routeProvider'];

  /**
   * Here we register help documentation for our plugin.
   * We can use markdown to describe the documentation.
   */
  function configureHelp(helpRegistry, $templateCache) {
    var path = 'plugin/help.md';
    helpRegistry.addUserDoc('simple', path);
    $templateCache.put(path, `
## Simple plugin

Help documentation for Simple plugin.
    `);
  }
  configureHelp.$inject = ['helpRegistry', '$templateCache'];

  /**
   * Here we set up top-level link to our plugin and sub menu links.
   * Each menu item requires an object with the following attributes:
   *   title   - Title of the menu item
   *   href    - A link of the menu item
   *   isValid - A function that returns whether or not this
   *             plugin has functionality that can be used for
   *             the current JVM
   *   rank    - The order in the menu. Higher ranks come first
   *             (default = 0)
   */
  function configureLayout(mainNavService) {
    // set rank = -10 to make sure the item is placed at the bottom
    mainNavService.addItem({
      title: 'Simple',
      href: '/simple',
      isValid: function () { return true; },
      rank: -10
    });
  }
  configureLayout.$inject = ['mainNavService'];

  /**
   * Here we define any initialisation to be done when this
   * AngularJS module is bootstrapped. (optional)
   */
  function initPlugin() {
    Simple.log.info(Simple.pluginName, "loaded");
  }
  initPlugin.$inject = [];

  /**
   * The controller for this plugin
   */
  function SimpleController($scope, jolokia) {
    var self = this;
    this.hello = "Hello world!";
    this.cpuLoad = "0";

    // register a watch with Jolokia on this mbean to
    // get updated metrics
    this.$onInit = function () {
      Core.register(jolokia, $scope, {
        type: 'read', mbean: 'java.lang:type=OperatingSystem',
        arguments: []
      }, Core.onSuccess(render));
    };

    // update display of metric
    function render(response) {
      Simple.log.info('SimpleController updated: ProcessCpuLoad =', response.value['ProcessCpuLoad']);
      self.cpuLoad = response.value['ProcessCpuLoad'];
    }
  }
  SimpleController.$inject = ['$scope', 'jolokia'];

  return Simple;

})(Simple || {});

// tell the Hawtio plugin loader about our plugin so it can be
// bootstrapped with the rest of AngularJS
hawtioPluginLoader.addModule(Simple.pluginName);
