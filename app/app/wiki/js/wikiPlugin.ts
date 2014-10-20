/**
 * @module Wiki
 * @main Wiki
 */
/// <reference path="wikiHelpers.ts"/>
/// <reference path="../../ui/js/dropDown.ts"/>
/// <reference path="../../core/js/workspace.ts"/>
/// <reference path="../../git/js/git.ts"/>
/// <reference path="../../git/js/gitHelpers.ts"/>
/// <reference path="../../helpers/js/pluginHelpers.ts"/>
/// <reference path="../../helpers/js/urlHelpers.ts"/>
/// <reference path="./wikiRepository.ts"/>
module Wiki {

  export var pluginName = 'wiki';
  export var templatePath = 'app/wiki/html/';
  export var tab:any = null;

  export var _module = angular.module(pluginName, ['bootstrap', 'ui.bootstrap.dialog', 'ui.bootstrap.tabs', 'ngResource', 'hawtioCore', 'hawtio-ui', 'tree', 'camel']);
  export var controller = PluginHelpers.createControllerFunction(_module, 'Wiki');
  export var route = PluginHelpers.createRoutingFunction(templatePath);

  _module.config(["$routeProvider", ($routeProvider) => {

    // allow optional branch paths...
    angular.forEach(["", "/branch/:branch"], (path) => {
      $routeProvider.
              when(UrlHelpers.join('/wiki', path, 'view'), route('viewPage.html', false)).
              when(UrlHelpers.join('/wiki', path, 'create/*page'), route('create.html', false)).
              when('/wiki' + path + '/view/*page', {templateUrl: 'app/wiki/html/viewPage.html', reloadOnSearch: false}).
              when('/wiki' + path + '/book/*page', {templateUrl: 'app/wiki/html/viewBook.html', reloadOnSearch: false}).
              when('/wiki' + path + '/edit/*page', {templateUrl: 'app/wiki/html/editPage.html'}).
              when('/wiki' + path + '/version/*page/:objectId', {templateUrl: 'app/wiki/html/viewPage.html'}).
              when('/wiki' + path + '/history/*page', {templateUrl: 'app/wiki/html/history.html'}).
              when('/wiki' + path + '/commit/*page/:objectId', {templateUrl: 'app/wiki/html/commit.html'}).
              when('/wiki' + path + '/diff/*page/:objectId/:baseObjectId', {templateUrl: 'app/wiki/html/viewPage.html', reloadOnSearch: false}).
              when('/wiki' + path + '/formTable/*page', {templateUrl: 'app/wiki/html/formTable.html'}).
              when('/wiki' + path + '/dozer/mappings/*page', {templateUrl: 'app/wiki/html/dozerMappings.html'}).
              when('/wiki' + path + '/configurations/*page', { templateUrl: 'app/wiki/html/configurations.html' }).
              when('/wiki' + path + '/configuration/:pid/*page', { templateUrl: 'app/wiki/html/configuration.html' }).
              when('/wiki' + path + '/newConfiguration/:factoryPid/*page', { templateUrl: 'app/wiki/html/configuration.html' }).
              when('/wiki' + path + '/camel/diagram/*page', {templateUrl: 'app/wiki/html/camelDiagram.html'}).
              when('/wiki' + path + '/camel/canvas/*page', {templateUrl: 'app/wiki/html/camelCanvas.html'}).
              when('/wiki' + path + '/camel/properties/*page', {templateUrl: 'app/wiki/html/camelProperties.html'});
    });
}]);

  _module.factory('wikiRepository', ["workspace", "jolokia", "localStorage", (workspace:Workspace, jolokia, localStorage) => {
    return new GitWikiRepository(() => Git.createGitRepository(workspace, jolokia, localStorage));
  }]);

  /**
   * Branch Menu service
   */
  export interface BranchMenu {
    addExtension: (item:UI.MenuItem) => void;
    applyMenuExtensions: (menu:UI.MenuItem[]) => void;
  }

  _module.factory('wikiBranchMenu', () => {
    var self = {
      items: [],
      addExtension: (item:UI.MenuItem) => {
        self.items.push(item);
      },
      applyMenuExtensions: (menu:UI.MenuItem[]) => {
        if (self.items.length === 0) {
          return;
        }
        var extendedMenu:UI.MenuItem[] = [{
          heading: "Actions"
        }];
        self.items.forEach((item:UI.MenuItem) => {
          if (item.valid()) {
            extendedMenu.push(item);
          }
        });
        if (extendedMenu.length > 1) {
          menu.add(extendedMenu);
        }
      }
    };
    return self;
  });

  _module.factory('fileExtensionTypeRegistry', () => {
    return {
      "image": ["svg", "png", "ico", "bmp", "jpg", "gif"],
      "markdown": ["md", "markdown", "mdown", "mkdn", "mkd"],
      "htmlmixed": ["html", "xhtml", "htm"],
      "text/x-java": ["java"],
      "text/x-scala": ["scala"],
      "javascript": ["js", "json", "javascript", "jscript", "ecmascript", "form"],
      "xml": ["xml", "xsd", "wsdl", "atom"],
      "properties": ["properties"]
    };
  });

  _module.filter('fileIconClass', () => iconClass);

  _module.run(["$location", "workspace", "viewRegistry", "jolokia", "localStorage", "layoutFull", "helpRegistry", "preferencesRegistry", "wikiRepository", "postLoginTasks", "$rootScope", ($location:ng.ILocationService,
        workspace:Workspace,
        viewRegistry,
        jolokia,
        localStorage,
        layoutFull,
        helpRegistry,
        preferencesRegistry,
        wikiRepository,
        postLoginTasks,
        $rootScope) => {

    viewRegistry['wiki'] = templatePath + 'layoutWiki.html';
    helpRegistry.addUserDoc('wiki', 'app/wiki/doc/help.md', () => {
      return Wiki.isWikiEnabled(workspace, jolokia, localStorage);
    });

    preferencesRegistry.addTab("Git", 'app/wiki/html/gitPreferences.html');

    tab = {
      id: "wiki",
      content: "Wiki",
      title: "View and edit wiki pages",
      isValid: (workspace:Workspace) => Wiki.isWikiEnabled(workspace, jolokia, localStorage),
      href: () => "#/wiki/view",
      isActive: (workspace:Workspace) => workspace.isLinkActive("/wiki") && !workspace.linkContains("fabric", "profiles") && !workspace.linkContains("editFeatures")
    };
    workspace.topLevelTabs.push(tab);

    postLoginTasks.addTask('wikiGetRepositoryLabel', () => {
      wikiRepository.getRepositoryLabel((label) => {
        tab.content = label;
        Core.$apply($rootScope)
      }, (response) => {
        // silently ignore
      });
    });

    // add empty regexs to templates that don't define
    // them so ng-pattern doesn't barf
    Wiki.documentTemplates.forEach((template: any) => {
      if (!template['regex']) {
        template.regex = /(?:)/;
      }
    });

  }]);

  hawtioPluginLoader.addModule(pluginName);
}
