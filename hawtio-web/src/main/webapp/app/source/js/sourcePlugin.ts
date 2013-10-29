module Source {
  var pluginName = 'source';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore', 'wiki']).
          config(($routeProvider) => {
            $routeProvider.
                    when('/source/index/:mavenCoords', {templateUrl: 'app/source/html/index.html'}).
                    when('/source/index/:mavenCoords/*page', {templateUrl: 'app/source/html/index.html'}).
                    when('/source/view/:mavenCoords/class/:className/*page', {templateUrl: 'app/source/html/source.html'}).
                    when('/source/view/:mavenCoords/*page', {templateUrl: 'app/source/html/source.html'}).
                    when('/source/javadoc/:mavenCoords/*page', {templateUrl: 'app/source/html/javadoc.html'});
          }).
          run(($location:ng.ILocationService, workspace:Workspace, viewRegistry, jolokia, localStorage, layoutFull, helpRegistry) => {

            viewRegistry['source'] = layoutFull;
            helpRegistry.addUserDoc('source', 'app/source/html/help.md');


        /*
                    workspace.topLevelTabs.push({
                      content: "Source",
                      title: "View source code of arti",
                      isValid: (workspace: Workspace) => Git.createGitRepository(workspace, jolokia, localStorage) !== null,
                      href: () => "#/wiki/view/wiki",
                      isActive: (workspace: Workspace) => workspace.isLinkActive("/wiki")
                    });
        */
          });

  hawtioPluginLoader.addModule(pluginName);
}
