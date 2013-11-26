/**
 * @module Wiki
 * @main Wiki
 */
module Wiki {

  var pluginName = 'wiki';

  export var templatePath = 'app/wiki/html/';

  angular.module(pluginName, ['bootstrap', 'ui.bootstrap.dialog', 'ui.bootstrap.tabs', 'ngResource', 'hawtioCore', 'hawtio-ui', 'tree', 'camel']).
          config(($routeProvider) => {

            // allow optional branch paths...
            angular.forEach(["", "/branch/:branch"], (path) => {
              $routeProvider.
                      when('/wiki' + path + '/view', {templateUrl: 'app/wiki/html/viewPage.html'}).
                      when('/wiki' + path + '/view/*page', {templateUrl: 'app/wiki/html/viewPage.html'}).
                      when('/wiki' + path + '/create/*page', {templateUrl: 'app/wiki/html/createPage.html'}).
                      when('/wiki' + path + '/edit/*page', {templateUrl: 'app/wiki/html/editPage.html'}).
                      when('/wiki' + path + '/history/*page', {templateUrl: 'app/wiki/html/history.html'}).
                      when('/wiki' + path + '/formTable/*page', {templateUrl: 'app/wiki/html/formTable.html'}).
                      when('/wiki' + path + '/dozer/mappings/*page', {templateUrl: 'app/wiki/html/dozerMappings.html'}).
                      when('/wiki' + path + '/camel/diagram/*page', {templateUrl: 'app/wiki/html/camelDiagram.html'}).
                      when('/wiki' + path + '/camel/canvas/*page', {templateUrl: 'app/wiki/html/camelCanvas.html'}).
                      when('/wiki' + path + '/camel/properties/*page', {templateUrl: 'app/wiki/html/camelProperties.html'});
            });

            $routeProvider.
                    when('/wiki/diff/*page/:objectId/:baseObjectId', {templateUrl: 'app/wiki/html/viewPage.html'}).
                    when('/wiki/version/*page/:objectId', {templateUrl: 'app/wiki/html/viewPage.html'}).
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
              "xml": ["xml", "xsd", "wsdl", "atom"],
              "properties": ["properties"]
            };
          }).
          filter('fileIconClass',() => iconClass).
          directive('wikiHrefAdjuster', ($location) => {
            return {
              restrict: 'A',
              link: ($scope, $element, $attr) => {

                $element.bind('DOMNodeInserted', (event) => {
                  var ays = $element.find('a');
                  angular.forEach(ays, (a) => {
                    if (a.hasAttribute('no-adjust')) {
                      return;
                    }
                    a = $(a);
                    var href = (a.attr('href') || "").trim();
                    if (href) {
                      var fileExtension = a.attr('file-extension');
                      var newValue = Wiki.adjustHref($scope, $location, href, fileExtension);
                      if (newValue) {
                        a.attr('href', newValue);
                      }
                    }
                  });
                  var imgs = $element.find('img');
                  angular.forEach(imgs, (a) => {
                    if (a.hasAttribute('no-adjust')) {
                      return;
                    }
                    a = $(a);
                    var href = (a.attr('src') || "").trim();
                    if (href) {
                      if (href.startsWith("/")) {
                        href = url(href);
                        a.attr('src', href);

                        // lets avoid this element being reprocessed
                        a.attr('no-adjust', 'true');
                      }
                    }
                  });
                })
              }
            }
          }).
          run(($location:ng.ILocationService, workspace:Workspace, viewRegistry, jolokia, localStorage, layoutFull, helpRegistry) => {

/*
            //viewRegistry['wiki/camel'] = "app/wiki/html/layoutCamel.html";
            var key = new RegExp('', '');
            Core.pathSet(viewRegistry, [key], "app/wiki/html/layoutCamel.html");
            //viewRegistry[key] = "app/wiki/html/layoutCamel.html";
*/
            viewRegistry["/wiki/(branch/^[/]+/)?camel/canvas/"] = layoutFull;
            //viewRegistry["/wiki/(branch/^[/]+/)?camel/canvas/"] = "app/wiki/html/layoutCamelCanvas.html";
            viewRegistry["/wiki/(branch/^[/]+/)?camel/.*/"] = "app/wiki/html/layoutCamel.html";
            viewRegistry['wiki'] = layoutFull;
            helpRegistry.addUserDoc('wiki', 'app/wiki/doc/help.md', () => {
              return Wiki.isWikiEnabled(workspace, jolokia, localStorage);
            });

            workspace.topLevelTabs.push({
              content: "Wiki",
              title: "View and edit wiki pages",
              isValid: (workspace:Workspace) => Wiki.isWikiEnabled(workspace, jolokia, localStorage),
              href: () => "#/wiki/view",
              isActive: (workspace:Workspace) => workspace.isLinkActive("/wiki") && !workspace.linkContains("fabric", "profiles") && !workspace.linkContains("editFeatures")
            });
          });

  hawtioPluginLoader.addModule(pluginName);
}
