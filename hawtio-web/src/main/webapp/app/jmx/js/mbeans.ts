
module Jmx {
  export function MBeansController($scope, $location: ng.ILocationService, workspace: Workspace) {
    $scope.workspace = workspace;
    $scope.tree = new Folder('MBeans');
    $scope.counter = 0;

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateSelectionFromURL, 50);
    });

    // we could use $scope.$on and $rootScope.$broadCast here but it seems watching
    // an expression may be a little more efficient and use less event broadcasting around controllers
    $scope.$watch('workspace.operationCounter', function () {
      $scope.counter += 1;
      loadTree();
      //setTimeout(loadTree, 1);
    });

    $scope.select = (node:DynaTreeNode) => {
      $scope.workspace.updateSelectionNode(node);
      $scope.$apply();
    };

    function updateSelectionFromURL() {
      updateTreeSelectionFromURL($location, $("#jmxtree"));
    }

    function folderGetOrElse(folder, value) {
      if (folder) {
        try {
          return folder.getOrElse(value);
        } catch (e) {
          console.log("Failed to find value " + value + " on folder " + folder);
        }
      }
      return null;
    }

    function populateTree(response) {
      var rootId = 'root';
      var separator = '_';
      workspace.mbeanTypesToDomain = {};
      var tree = new Folder('MBeans');
      tree.key = rootId;
      var domains = response.value;
      for (var domain in domains) {
        var mbeans = domains[domain];
        for (var path in mbeans) {
          var entries = {};
          var folder = folderGetOrElse(tree, domain);
          //if (!folder) continue;
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
            folder = folderGetOrElse(folder, value);
            if (folder) {
              folder.domain = domain;
              folderNames.push(value);
              folder.folderNames = folderNames;
              folder.key = rootId + separator + folderNames.join(separator);
              folderNames = folderNames.clone();
            }
          });
          var key = rootId + separator + folderNames.join(separator) + separator + lastPath;
          var typeName = entries["Type"] || entries["type"];
          var objectName = domain + ":" + path;
          var mbeanInfo:NodeSelection = {
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
            get: (key:string) => null
          };

          if (typeName) {
            var map = workspace.mbeanTypesToDomain[typeName];
            if (!map) {
              map = {};
              workspace.mbeanTypesToDomain[typeName] = map;
            }
            var value = map[domain];
            if (!value) {
              map[domain] = mbeanInfo;
            } else {
              var array = null;
              if (angular.isArray(value)) {
                array = value;
              } else {
                array = [value];
                map[domain] = array;
              }
              array.push(mbeanInfo);
            }
          }
          if (folder) {
            try {
              folder.getOrElse(lastPath, mbeanInfo);
            } catch (e) {
              console.log("Failed to find value " + lastPath + " on folder " + folder);
            }
          } else {
            console.log("No folder found for lastPath: " + lastPath);
          }
        }
      }
      // TODO we should do a merge across...
      // so we only insert or delete things!
      $scope.tree = tree;
      if ($scope.workspace) {
        $scope.workspace.tree = tree;
      }
      $scope.$apply();
      console.log("Loaded tree!");

      var treeElement = $("#jmxtree");

      // TODO move this code to use Jmx.enableTree()....
      if (treeElement.length) {
        treeElement.dynatree({
          /**
           * The event handler called when a different node in the tree is selected
           */
          onActivate: function (node:DynaTreeNode) {
            var data = node.data;
            $scope.select(data);
          },
          onClick: function (node:DynaTreeNode, event:Event) {
            if (event["metaKey"]) {
              event.preventDefault();
              var url = $location.absUrl();
              if (node && node.data) {
                var key = node.data["key"];
                if (key) {
                  var hash = $location.search();
                  hash["nid"] = key;

                  // TODO this could maybe be a generic helper function?
                  // lets trim after the ?
                  var idx = url.indexOf('?');
                  if (idx <= 0) {
                    url += "?";
                  } else {
                    url = url.substring(0, idx + 1);
                  }
                  url += $.param(hash);
                }
              }
              window.open(url, '_blank');
              window.focus();
              return false;
            }
            return true;
          },
          persist: false,
          debugLevel: 0,
          children: $scope.workspace.tree.children
        });
      }
      if (treeElement.length) {
        if ($scope.counter > 1) {
          //console.log("Reloading the tree as counter is " + $scope.counter);
          treeElement.dynatree("getTree").reload();
        }
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
}