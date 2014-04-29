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
                      when('/wiki' + path + '/view', {templateUrl: 'app/wiki/html/viewPage.html', reloadOnSearch: false}).
                      when('/wiki' + path + '/view/*page', {templateUrl: 'app/wiki/html/viewPage.html', reloadOnSearch: false}).
                      when('/wiki' + path + '/book/*page', {templateUrl: 'app/wiki/html/viewBook.html', reloadOnSearch: false}).
                      when('/wiki' + path + '/create/*page', {templateUrl: 'app/wiki/html/createPage.html'}).
                      when('/wiki' + path + '/edit/*page', {templateUrl: 'app/wiki/html/editPage.html'}).
                      when('/wiki' + path + '/version/*page/:objectId', {templateUrl: 'app/wiki/html/viewPage.html'}).
                      when('/wiki' + path + '/history/*page', {templateUrl: 'app/wiki/html/history.html'}).
                      when('/wiki' + path + '/commit/*page/:objectId', {templateUrl: 'app/wiki/html/commit.html'}).
                      when('/wiki' + path + '/diff/*page/:objectId/:baseObjectId', {templateUrl: 'app/wiki/html/viewPage.html', reloadOnSearch: false}).
                      when('/wiki' + path + '/formTable/*page', {templateUrl: 'app/wiki/html/formTable.html'}).
                      when('/wiki' + path + '/dozer/mappings/*page', {templateUrl: 'app/wiki/html/dozerMappings.html'}).
                      when('/wiki' + path + '/configurations/*page', { templateUrl: 'app/wiki/html/configurations.html' }).
                      when('/wiki' + path + '/configuration/:pid/*page', { templateUrl: 'app/wiki/html/configuration.html' }).
                      when('/wiki' + path + '/configuration/:pid/:factoryPid/*page', { templateUrl: 'app/wiki/html/configuration.html' }).
                      when('/wiki' + path + '/camel/diagram/*page', {templateUrl: 'app/wiki/html/camelDiagram.html'}).
                      when('/wiki' + path + '/camel/canvas/*page', {templateUrl: 'app/wiki/html/camelCanvas.html'}).
                      when('/wiki' + path + '/camel/properties/*page', {templateUrl: 'app/wiki/html/camelProperties.html'});
            });
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
          directive('wikiTitleLinker', ($location) => {
            return {
              restrict: 'A',
              link: ($scope, $element, $attr) => {
                var loaded = false;

                function offsetTop(elements) {
                  if (elements) {
                    var offset = elements.offset();
                    if (offset) {
                      return offset.top;
                    }
                  }
                  return 0;
                }

                function scrollToHash() {
                  var answer = false;
                  var id = $location.search()["hash"];
                  return scrollToId(id);
                }

                function scrollToId(id) {
                  var answer = false;
                  var id = $location.search()["hash"];
                  if (id) {
                    var selector = 'a[name="' + id + '"]';
                    var targetElements = $element.find(selector);
                    if (targetElements && targetElements.length) {
                      var scrollDuration = 1;
                      var delta = offsetTop($($element));
                      var top = offsetTop(targetElements) - delta;
                      if (top < 0) {
                        top = 0;
                      }
                      //log.info("scrolling to hash: " + id + " top: " + top + " delta:" + delta);
                      $('body,html').animate({
                        scrollTop: top
                      }, scrollDuration);
                      answer = true;
                    } else {
                      //log.info("could find element for: " + selector);
                    }
                  }
                  return answer;
                }

                function addLinks(event) {
                  var headings = $element.find('h1,h2,h3,h4,h5,h6,h7');
                  var updated = false;
                  angular.forEach(headings, (he) => {
                    var h1 = $(he);
                    // now lets try find a child header
                    var a = h1.parent("a");
                    if (!a || !a.length) {
                      var text = h1.text();
                      if (text) {
                        var target = text.replace(/ /g, "-");
                        var pathWithHash = "#" + $location.path() + "?hash=" + target;
                        var link = Core.createHref($location, pathWithHash, ['hash']);

                        // lets wrap the heading in a link
                        var newA = $('<a name="' + target + '" href="' + link + '" ng-click="onLinkClick()"></a>');
                        newA.on("click", () => {
                          setTimeout(() => {
                            if (scrollToId(target)) {
                            }
                          }, 50);
                        });

                        newA.insertBefore(h1);
                        h1.detach();
                        newA.append(h1);
                        updated = true;
                      }
                    }
                  });
                  if (updated && !loaded) {
                    setTimeout(() => {
                      if (scrollToHash()) {
                        loaded = true;
                      }
                    }, 50);
                  }
                }

                function onEventInserted(event) {
                  // avoid any more events while we do our thing
                  $element.unbind('DOMNodeInserted', onEventInserted);
                  addLinks(event);
                  $element.bind('DOMNodeInserted', onEventInserted);
                }

                $element.bind('DOMNodeInserted', onEventInserted);
              }
            };
          }).
          run(($location:ng.ILocationService, workspace:Workspace, viewRegistry, jolokia, localStorage, layoutFull, helpRegistry, preferencesRegistry, wikiRepository) => {

            viewRegistry['wiki'] = layoutFull;
            helpRegistry.addUserDoc('wiki', 'app/wiki/doc/help.md', () => {
              return Wiki.isWikiEnabled(workspace, jolokia, localStorage);
            });

            preferencesRegistry.addTab("Git", 'app/wiki/html/gitPreferences.html');
            var tab = {
              id: "wiki",
              content: "Wiki",
              title: "View and edit wiki pages",
              isValid: (workspace:Workspace) => Wiki.isWikiEnabled(workspace, jolokia, localStorage),
              href: () => "#/wiki/view",
              isActive: (workspace:Workspace) => workspace.isLinkActive("/wiki") && !workspace.linkContains("fabric", "profiles") && !workspace.linkContains("editFeatures")
            }
            workspace.topLevelTabs.push(tab);
            wikiRepository.getRepositoryLabel(function(label){
              tab.content=label
            }, function (response) {
              console.log(response)
            });

            // add empty regexs to templates that don't define
            // them so ng-pattern doesn't barf
            Wiki.documentTemplates.forEach((template: any) => {
              log.debug("Checking template: ", template);
              if (!template['regex']) {
                log.debug("Setting regex");
                template.regex = /(?:)/;
              }
            });

          });

  hawtioPluginLoader.addModule(pluginName);
}
