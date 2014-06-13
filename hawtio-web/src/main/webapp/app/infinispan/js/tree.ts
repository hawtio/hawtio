/// <reference path="infinispanPlugin.ts"/>
module Infinispan {

  _module.controller("Infinispan.TreeController", ["$scope", "$location", "workspace", ($scope, $location:ng.ILocationService, workspace:Workspace) => {

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateSelectionFromURL, 50);
    });

    $scope.$watch('workspace.tree', function () {
      if (workspace.moveIfViewInvalid()) return;

      var children = [];

      // lets pull out each context

      var tree = workspace.tree;
      if (tree) {
        var domainName = Infinispan.jmxDomain;
        var folder = tree.get(domainName);
        if (folder) {
          var cachesFolder = new Folder("Caches");
          cachesFolder.domain = domainName;
          cachesFolder.key = "root-Infinispan-Caches";
          cachesFolder.typeName = "Caches";
          children.push(cachesFolder);
          addAllCacheStatistics(folder, cachesFolder);
        }

        var treeElement = $("#infinispantree");
        Jmx.enableTree($scope, $location, workspace, treeElement, children);

        // lets do this asynchronously to avoid Error: $digest already in progress
        setTimeout(updateSelectionFromURL, 50);
      }
    });

    function addAllCacheStatistics(folder, answer) {
      if (folder) {
        var children = folder.children;
        if (children) {
          angular.forEach(folder.children, (value, key) => {
            if (value.objectName && value.title === "Statistics") {
              var cacheName = value.parent.parent.title || value.title;
              var name = humanizeValue(cacheName);
              var cacheFolder = new Folder(name);
              cacheFolder.addClass = "org-infinispn-cache";
              cacheFolder.typeName = "Cache";
              cacheFolder.key = answer.key + "-" + cacheName;
              cacheFolder.objectName = value.objectName;
              cacheFolder.domain = value.domain;
              cacheFolder.entries = value.entries;
              answer.children.push(cacheFolder);
            } else {
              addAllCacheStatistics(value, answer);
            }
          });
        }
      }
    }

    function updateSelectionFromURL() {
      Jmx.updateTreeSelectionFromURL($location, $("#infinispantree"), true);
    }
  }]);
}
