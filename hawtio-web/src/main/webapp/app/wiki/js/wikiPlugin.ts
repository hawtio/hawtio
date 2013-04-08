module Wiki {
  var pluginName = 'wiki';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).
          config(($routeProvider) => {
            $routeProvider.
                    when('/wiki/view/*page', {templateUrl: 'app/wiki/html/viewPage.html'}).
                    when('/wiki/formTable/*page', {templateUrl: 'app/wiki/html/formTable.html'}).
                    when('/wiki/camel/*page', {templateUrl: 'app/wiki/html/camel.html'}).
                    when('/wiki/version/*page/:objectId', {templateUrl: 'app/wiki/html/viewPage.html'}).
                    when('/wiki/diff/*page/:objectId/:baseObjectId', {templateUrl: 'app/wiki/html/viewPage.html'}).
                    when('/wiki/create/*page', {templateUrl: 'app/wiki/html/createPage.html'}).
                    when('/wiki/edit/*page', {templateUrl: 'app/wiki/html/editPage.html'}).
                    when('/wiki/history/*page', {templateUrl: 'app/wiki/html/history.html'});
          }).
          factory('wikiRepository',function (workspace:Workspace, jolokia, localStorage) {
            return new GitWikiRepository(() => Git.createGitRepository(workspace, jolokia, localStorage));
          }).
          factory('fileExtensionTypeRegistry',function () {
            return {
              "markdown": ["md", "markdown", "mdown", "mkdn", "mkd"],
              "htmlmixed": ["html", "xhtml", "htm"],
              "text/x-java": ["java"],
              "text/x-scala": ["scala"],
              "javascript": ["js", "json", "javascript", "jscript", "ecmascript", "form"],
              "xml": ["xml"],
              "properties": ["properties"]
            };
          }).
          filter('fileIconClass',() => iconClass).
          run(($location:ng.ILocationService, workspace:Workspace, viewRegistry, jolokia, localStorage, layoutFull) => {

            viewRegistry['wiki'] = layoutFull;

            workspace.topLevelTabs.push({
              content: "Wiki",
              title: "View and edit wiki pages",
              isValid: (workspace: Workspace) => Git.createGitRepository(workspace, jolokia, localStorage) !== null,
              href: () => "#/wiki/view/wiki",
              isActive: (workspace: Workspace) => workspace.isLinkActive("/wiki")
            });
          });

  hawtioPluginLoader.addModule(pluginName);
}
