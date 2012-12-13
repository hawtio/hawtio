var myApp = angular.module('hawt.io', ['bootstrap', 'ngResource']);
myApp.config(($routeProvider) => {
          $routeProvider.
                  when('/attributes', {templateUrl: 'app/core/html/attributes.html', controller: AttributesController}).
                  when('/operations', {templateUrl: 'app/core/html/operations.html', controller: OperationsController}).
                  when('/charts', {templateUrl: 'app/core/html/charts.html', controller: ChartController}).
                  when('/chartEdit', {templateUrl: 'app/core/html/chartEdit.html', controller: ChartEditController}).
                  when('/preferences', {templateUrl: 'app/core/html/preferences.html'}).
                  when('/logs', {templateUrl: 'app/core/html/logs.html', controller: LogController}).
                  when('/help', {
                    redirectTo: '/help/overview'
                  }).
                  when('/help/:tabName', {templateUrl: 'app/core/html/help.html', controller: NavBarController}).
                  when('/debug', {templateUrl: 'app/core/html/debug.html', controller: AttributesController}).

                  // health
                  when('/health', {templateUrl: 'app/core/html/health.html', controller: HealthController}).

                  // activemq
                  when('/browseQueue', {templateUrl: 'app/activemq/html/browseQueue.html', controller: BrowseQueueController}).
                  when('/subscribers', {templateUrl: 'app/activemq/html/subscribers.html', controller: SubscriberGraphController}).
                  when('/createQueue', {templateUrl: 'app/activemq/html/createQueue.html', controller: DestinationController}).
                  when('/createTopic', {templateUrl: 'app/activemq/html/createTopic.html', controller: DestinationController}).
                  when('/deleteQueue', {templateUrl: 'app/activemq/html/deleteQueue.html', controller: DestinationController}).
                  when('/deleteTopic', {templateUrl: 'app/activemq/html/deleteTopic.html', controller: DestinationController}).

                  // camel
                  when('/browseEndpoint', {templateUrl: 'app/camel/html/browseEndpoint.html', controller: BrowseEndpointController}).
                  when('/sendMessage', {templateUrl: 'app/camel/html/sendMessage.html', controller: SendMessageController}).
                  when('/routes', {templateUrl: 'app/camel/html/routes.html', controller: CamelController}).
                  when('/createEndpoint', {templateUrl: 'app/camel/html/createEndpoint.html', controller: EndpointController}).

                  // osgi
                  when('/bundles', {templateUrl: 'app/osgi/html/bundles.html', controller: BundleController}).

                  otherwise({redirectTo: '/help/overview'});
        }).
        factory('workspace',($rootScope, $routeParams, $location, $compile, $templateCache) => {
          var jolokiaUrl = $location.search()['url'] || url("/jolokia");
          $.support.cors = true;
          var workspace =  new Workspace(jolokiaUrl, $location, $compile, $templateCache);

          /**
           * Count the number of lines in the given text
           */
          $rootScope.lineCount = lineCount;

          /**
           * Detect the text format such as javascript or xml
           */
          $rootScope.detectTextFormat = detectTextFormat;

          /**
           * Easy access to route params
           */
          $rootScope.params = $routeParams;

          /**
           * Wrapper for angular.isArray, isObject, etc checks for use in the view
           *
           * @param type {string} the name of the check (casing sensitive)
           * @param value {string} value to check
           */
          $rootScope.is = function(type, value) {
          	return angular['is'+type](value);
          };

          /**
           * Wrapper for $.isEmptyObject()
           *
           * @param value	{mixed} Value to be tested
           * @return boolean
           */
          $rootScope.empty = function(value) {
          	return $.isEmptyObject(value);
          };

          /**
           * Debugging Tools
           *
           * Allows you to execute debug functions from the view
           */
          $rootScope.log = function(variable) {
          	console.log(variable);
          };
          $rootScope.alert = function(text) {
          	alert(text);
          };
          return workspace;
        }).
        filter('humanize', () => humanizeValue);

function NavBarController($scope, $location, workspace:Workspace) {
  $scope.workspace = workspace;

  $scope.validSelection = (uri) => workspace.validSelection(uri);

  // when we change the view/selection lets update the hash so links have the latest stuff
  $scope.$on('$routeChangeSuccess', function () {
    var hash = $location.search();
    // TODO there must be a nice function somewhere to do this in a nicer way!
    // NOTE we are not encoding anything
    var text = "";
    if (hash) {
      for (var key in hash) {
        var value = hash[key];
        if (key && value) {
          if (text.length === 0) {
            text = "?";
          } else {
            text += "&"
          }
          text += key + "=" + value;
        }
      }
    }
    $scope.hash = encodeURI(text);
  });

  $scope.navClass = (page) => {
    var currentRoute = $location.path().substring(1) || 'home';
    return currentRoute.startsWith(page) ? 'active' : '';
  };
}

function HelpController($scope, $routeParams, $location) {
  // Each time controller is recreated, check tab in url
  $scope.currentTab = $routeParams.tabName;

  // When we click on a tab, the directive changes currentTab
  $scope.$watch('currentTab', function (name, oldName) {
    if (name !== oldName) {
      $location.path('help/' + name);
    }
  });
}

function PreferencesController($scope, workspace:Workspace) {
  $scope.workspace = workspace;
  $scope.updateRate = workspace.getUpdateRate();

  $scope.$watch('updateRate', () => {
    $scope.workspace.setUpdateRate($scope.updateRate);
  });

  $scope.gotoServer = (url) => {
    console.log("going to server: " + url);
    //window.location = "#/attributes?url=" + url;
    window.open("#/attributes?url=" + encodeURIComponent(url));
  }
}

function updateSelectionNode($location, node) {
  var key = null;
  if (node) {
    key = node['key'];
  }
  var q = $location.search();
  if (key) {
    q['nid'] = key
  }
  $location.search(q);
}

function MBeansController($scope, $location, workspace:Workspace) {
  $scope.workspace = workspace;
  $scope.tree = new Folder('MBeans');
  $scope.counter = 0;

  $scope.$on("$routeChangeSuccess", function (event, current, previous) {
    // lets do this asynchronously to avoid Error: $digest already in progress
    setTimeout(updateSelectionFromURL, 50);
  });

  $scope.$watch('workspace.operationCounter', function () {
    $scope.counter += 1;
    loadTree();
    //setTimeout(loadTree, 1);
  });

  $scope.select = (node) => {
    $scope.workspace.selection = node;
    updateSelectionNode($location, node);
    $scope.$apply();
  };

  function updateSelectionFromURL() {
    var key = $location.search()['nid'];
    if (key) {
      var node = $("#jmxtree").dynatree("getTree").activateKey(key);
      if (node) {
        node.expand(true);
      }
    }
  }

  function populateTree(response) {
    var rootId = 'root';
    var separator = '_';
    var tree = new Folder('MBeans');
    tree.key = rootId;
    var domains = response.value;
    for (var domain in domains) {
      var mbeans = domains[domain];
      for (var path in mbeans) {
        var entries = {};
        var folder = tree.getOrElse(domain);
        folder.domain = domain;
        if (!folder.key) {
          folder.key = rootId + separator + domain;
        }
        var folderNames = [domain];
        folder.folderNames = folderNames;
        folderNames = folderNames.clone();
        var items = path.split(',');
        var paths = [];
        items.forEach(item => {
          var kv = item.split('=');
          var key = kv[0];
          var value = kv[1] || key;
          entries[key] = value;
          paths.push(value);
        });

        var lastPath = paths.pop();
        paths.forEach(value => {
          folder = folder.getOrElse(value);
          folder.domain = domain;
          folderNames.push(value);
          folder.folderNames = folderNames;
          folder.key = rootId + separator + folderNames.join(separator);
          folderNames = folderNames.clone();
        });
        var key = rootId + separator + folderNames.join(separator) + separator + lastPath;
        var typeName = entries["Type"] || entries["type"];
        var objectName = domain + ":" + path;
        var mbeanInfo: NodeSelection = {
          key: key,
          title: trimQuotes(lastPath),
          domain: domain,
          path: path,
          paths: paths,
          objectName: objectName,
          parent: folder,
          entries: entries,
          typeName: typeName,
          addClass: escapeDots(key),
          get: (key: string) => null
        };
        if (typeName === "Health") {
          workspace.domainToHealth[domain] = objectName;
        }
        folder.getOrElse(lastPath, mbeanInfo);
      }
    }
    // TODO we should do a merge across...
    // so we only insert or delete things!
    $scope.tree = tree;
    if ($scope.workspace) {
      $scope.workspace.tree = tree;
    }
    $scope.$apply();

    var treeElement = $("#jmxtree");
    treeElement.dynatree({
      onActivate: function (node) {
        var data = node.data;
        $scope.select(data);
      },
      persist: false,
      debugLevel: 0,
      children: $scope.workspace.tree.children
    });
    if ($scope.counter > 1) {
      //console.log("Reloading the tree as counter is " + $scope.counter);
      treeElement.dynatree("getTree").reload();
    }
    updateSelectionFromURL();
  }

  function loadTree() {
    var jolokia = workspace.jolokia;
    jolokia.request(
            {type: 'list'},
            onSuccess(populateTree, {canonicalNaming: false, maxDepth: 2}));
  }

  //loadTree();
  // TODO auto-refresh the tree...
}


myApp.directive('expandable', function() {
  return {
    restrict: 'C',
    replace: false,
    link: function(scope, element, attrs) {
      var expandable = $(element);

      var title = expandable.find('.title');
      var button = expandable.find('.cancel');

      button.bind('click', function() {
        expandable.addClass('closed');
        expandable.removeClass('opened');
        return false;
      });

      title.bind('click', function() {
        expandable.toggleClass('opened');
        expandable.toggleClass('closed');
        return false;
      });

    }
  }

});




