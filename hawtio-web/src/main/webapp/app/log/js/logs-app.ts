module Log {
  var pluginName = 'log';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).config(($routeProvider) => {
    $routeProvider.
            when('/logs', {templateUrl: 'app/log/html/logs.html', controller: LogController})
  }).
          run(($location: ng.ILocationService, workspace:Workspace) => {
            // now lets register the nav bar stuff!
            var map = workspace.uriValidations;
            map['logs'] = () => workspace.isOsgiFolder();

            workspace.topLevelTabs.push( {
              content: "Logs",
              title: "View and search the logs of this container",
              isValid: () => workspace.treeContainsDomainAndProperties('org.fusesource.insight', {type: 'LogQuery'}),
              href: () => url("#/logs")
            });

            workspace.subLevelTabs.push( {
              content: '<i class="icon-list-alt"></i> Log',
              title: "View the logs in this process",
              isValid: () => workspace.hasDomainAndProperties('org.fusesource.insight', {type: 'LogQuery'}),
              href: () => "#/bundles"
            });
          });

  hawtioPluginLoader.addModule(pluginName);
}
