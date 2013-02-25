module Source {
  var pluginName = 'source';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore', 'wiki']).
          config(($routeProvider) => {
            $routeProvider.
                    when('/source/view/:groupId/:artifactId/:versionId/:page', {templateUrl: 'app/source/html/source.html'});

            // TODO this is a dirty hack until AngularJS supports catch-all / wildcard / regex paths!
            var numberOfPaths = 10;
            for (var max = 1; max <= numberOfPaths; max++) {
              var path = ":path0";
              for (var i = 1; i <= max; i++) {
                path += "/:path" + i;
              }
              $routeProvider.
                      when('/source/view/:groupId/:artifactId/:versionId/' + path, {templateUrl: 'app/source/html/source.html'});
            }
          }).
          run(($location:ng.ILocationService, workspace:Workspace, viewRegistry, jolokia, localStorage, layoutFull) => {

            viewRegistry['source'] = layoutFull;

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
