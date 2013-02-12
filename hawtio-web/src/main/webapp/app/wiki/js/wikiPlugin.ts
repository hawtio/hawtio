module Wiki {
  var pluginName = 'wiki';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).
          config(($routeProvider) => {
            $routeProvider.
                    when('/wiki/view/:page', {templateUrl: 'app/wiki/html/viewPage.html'}).
                    when('/wiki/edit/:page', {templateUrl: 'app/wiki/html/editPage.html'});
          }).
          factory('wikiRepository',function (workspace:Workspace, jolokia, localStorage) {
            return new GitWikiRepository(() => Git.createGitRepository(workspace, jolokia, localStorage));
          }).
          factory('marked',function (workspace:Workspace, jolokia, localStorage) {
            marked.setOptions({
              gfm: true,
              tables: true,
              breaks: false,
              pedantic: false,
              sanitize: true,
              smartLists: true,
              langPrefix: 'language-'
/*
              highlight: function(code, lang) {
                if (lang === 'js') {
                  return highlighter.javascript(code);
                }
                return code;
              }
*/
            });
            return marked;
          }).
          run(($location:ng.ILocationService, workspace:Workspace, viewRegistry, jolokia, localStorage) => {

            viewRegistry['wiki'] = "app/wiki/html/layoutWiki.html";

            workspace.topLevelTabs.push({
              content: "Wiki",
              title: "View and edit wiki pages",
              isValid: () => Git.createGitRepository(workspace, jolokia, localStorage) !== null,
              href: () => "#/wiki/view/index"
            });
          });

  hawtioPluginLoader.addModule(pluginName);
}
