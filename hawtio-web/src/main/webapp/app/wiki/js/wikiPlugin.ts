module Wiki {
  var pluginName = 'wiki';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).
          config(($routeProvider) => {
            $routeProvider.
                    when('/wiki/view/:page', {templateUrl: 'app/wiki/html/viewPage.html'}).
                    when('/wiki/version/:page/:objectId', {templateUrl: 'app/wiki/html/viewPage.html'}).
                    when('/wiki/diff/:page/:objectId/:baseObjectId', {templateUrl: 'app/wiki/html/viewPage.html'}).
                    when('/wiki/create/:page', {templateUrl: 'app/wiki/html/createPage.html'}).
                    when('/wiki/edit/:page', {templateUrl: 'app/wiki/html/editPage.html'}).
                    when('/wiki/history/:page', {templateUrl: 'app/wiki/html/history.html'});

            // TODO this is a dirty hack until AngularJS supports catch-all / wildcard / regex paths!
            var numberOfPaths = 10;
            for (var max = 1; max <= numberOfPaths; max++) {
              var path = ":path0";
              for (var i = 1; i <= max; i++) {
                path += "/:path" + i;
              }
              $routeProvider.
                      when('/wiki/view/' + path, {templateUrl: 'app/wiki/html/viewPage.html'}).
                      when('/wiki/version' + path + '/:objectId', {templateUrl: 'app/wiki/html/viewPage.html'}).
                      when('/wiki/diff' + path + '/:objectId/:baseObjectId', {templateUrl: 'app/wiki/html/viewPage.html'}).
                      when('/wiki/create/' + path, {templateUrl: 'app/wiki/html/createPage.html'}).
                      when('/wiki/edit/' + path, {templateUrl: 'app/wiki/html/editPage.html'}).
                      when('/wiki/history' + path, {templateUrl: 'app/wiki/html/history.html'});
            }
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
          factory('fileExtensionTypeRegistry',function () {
            return {
              "markdown": ["md", "markdown", "mdown", "mkdn", "mkd"],
              "htmlmixed": ["html", "xhtml", "htm"],
              "javascript": ["js", "json", "javascript", "jscript", "ecmascript"],
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
              isValid: () => Git.createGitRepository(workspace, jolokia, localStorage) !== null,
              href: () => "#/wiki/view/wiki",
              isActive: () => workspace.isLinkActive("/wiki")
            });
          });

  hawtioPluginLoader.addModule(pluginName);
}
