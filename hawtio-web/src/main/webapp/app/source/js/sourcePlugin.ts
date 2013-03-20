module Source {
  var pluginName = 'source';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore', 'wiki']).
          config(($routeProvider) => {
            $routeProvider.
                    when('/source/index/:mavenCoords', {templateUrl: 'app/source/html/index.html'}).
                    when('/source/index/:mavenCoords/:page', {templateUrl: 'app/source/html/index.html'}).
                    when('/source/view/:mavenCoords/:className/:page', {templateUrl: 'app/source/html/source.html'}).
                    when('/source/javadoc/:mavenCoords/:page', {templateUrl: 'app/source/html/javadoc.html'});

            // TODO this is a dirty hack until AngularJS supports catch-all / wildcard / regex paths!
            var numberOfPaths = 10;
            for (var max = 1; max <= numberOfPaths; max++) {
              var path = ":path0";
              for (var i = 1; i <= max; i++) {
                path += "/:path" + i;
              }
              $routeProvider.
                      when('/source/index/:mavenCoords/' + path, {templateUrl: 'app/source/html/index.html'});
              $routeProvider.
                      when('/source/view/:mavenCoords/:className/' + path, {templateUrl: 'app/source/html/source.html'});
              $routeProvider.
                      when('/source/javadoc/:mavenCoords/' + path, {templateUrl: 'app/source/html/javadoc.html'});
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
