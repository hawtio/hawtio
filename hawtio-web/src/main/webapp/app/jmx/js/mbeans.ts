
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
      workspace.mbeanServicesToDomain = {};
      var tree = new Folder('MBeans');
      tree.key = rootId;
      var domains = response.value;
      for (var domain in domains) {
        var domainClass = escapeDots(domain);
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
          var typeName = null;
          var serviceName = null;
          items.forEach(item => {
            var kv = item.split('=');
            var key = kv[0];
            var value = kv[1] || key;
            entries[key] = value;
            var moveToFront = false;
            var lowerKey = key.toLowerCase();
            if (lowerKey === "type") {
              typeName = value;
              // if the type name value already exists in the root node
              // of the domain then lets move this property around too
              if (folder.map[value]) {
                moveToFront = true;
              }
            }
            if (lowerKey === "service") {
              serviceName = value;
            }
            if (moveToFront) {
              paths.splice(0, 0, value);
            } else {
              paths.push(value);
            }
          });

          function configureFolder(folder: Folder, name: string) {
            folder.domain = domain;
            folder.key = rootId + separator + folderNames.join(separator);
            folder.folderNames = folderNames.clone();
            //var classes = escapeDots(folder.key);
            var classes = "";
            var entries = folder.entries;
            var entryKeys = Object.keys(entries).filter((n) => n.toLowerCase().indexOf("type") >= 0);
            if (entryKeys.length) {
              angular.forEach(entryKeys, (entryKey) => {
                var entryValue = entries[entryKey];
                if (!folder.ancestorHasEntry(entryKey, entryValue)) {
                  classes += " " + domainClass + separator + entryValue;
                }
              });
            } else {
              var kindName = folderNames.last();
              /*if (folder.parent && folder.parent.title === typeName) {
                kindName = typeName;
              } else */
              if (kindName === name) {
                kindName += "_Folder";
              }
              if (kindName) {
                classes += " " + domainClass + separator + kindName;
              }
            }
            folder.addClass = classes;
            return folder;
          }

          var lastPath = paths.pop();
          paths.forEach(value => {
            folder = folderGetOrElse(folder, value);
            if (folder) {
              folderNames.push(value);
              configureFolder(folder, value);
            }
          });
          var key = rootId + separator + folderNames.join(separator) + separator + lastPath;
          var objectName = domain + ":" + path;
/*
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
*/

          if (folder) {
            folder = folderGetOrElse(folder, lastPath);
            if (folder) {
              // lets add the various data into the folder
              folder.entries = entries;
              configureFolder(folder, lastPath);
              folder.key = key;
              folder.title = trimQuotes(lastPath);
              folder.objectName = objectName;
              folder.typeName = typeName;


              function addFolderByDomain(owner, typeName) {
                var map = owner[typeName];
                if (!map) {
                  map = {};
                  owner[typeName] = map;
                }
                var value = map[domain];
                if (!value) {
                  map[domain] = folder;
                } else {
                  var array = null;
                  if (angular.isArray(value)) {
                    array = value;
                  } else {
                    array = [value];
                    map[domain] = array;
                  }
                  array.push(folder);
                }
              }
              
              if (serviceName) {
                addFolderByDomain(workspace.mbeanServicesToDomain, serviceName);
              }
              if (typeName) {
                addFolderByDomain(workspace.mbeanTypesToDomain, typeName);
              }
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
      enableTree($scope, $location, workspace, treeElement, $scope.workspace.tree.children, treeElement.length && $scope.counter > 1);

      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateSelectionFromURL, 50);
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