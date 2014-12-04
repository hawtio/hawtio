var SamplePlugin = (function(SamplePlugin) {

	SamplePlugin.pluginName = 'sample-plugin';
	SamplePlugin.log = Logger.get('SamplePlugin');
	SamplePlugin.contextPath = "/hawtio/plugins/";
	SamplePlugin.templatePath = SamplePlugin.contextPath + "sample-plugin/html/";

	SamplePlugin.module = angular.module('sample-plugin', ['hawtioCore'])
      .config(function($routeProvider) {
        $routeProvider.
            when('/sample-plugin', {
              templateUrl: SamplePlugin.templatePath + 'sample-plugin.html'
            });
      });

	SamplePlugin.module.run(function(workspace, viewRegistry, layoutFull) {

	SamplePlugin.log.info(SamplePlugin.pluginName, " loaded");
    viewRegistry["sample-plugin"] = layoutFull;
    workspace.topLevelTabs.push({
      id: "samplePlugin",
      content: "Sample Plugin",
      title: "Sample plugin loaded dynamically",
      isValid: function(workspace) { return true; },
      href: function() { return "#/sample-plugin"; },
      isActive: function(workspace) { return workspace.isLinkActive("sample-plugin"); }

    });

  });

  SamplePlugin.SamplePluginController = function($scope, jolokia) {
    $scope.message = "hello world";
    Core.$apply($scope);    
  };

  return SamplePlugin;

})(SamplePlugin || {});

hawtioPluginLoader.addModule(SamplePlugin.pluginName);