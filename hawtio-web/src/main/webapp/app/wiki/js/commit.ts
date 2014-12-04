/**
 * @module Wiki
 */
/// <reference path="./wikiPlugin.ts"/>
module Wiki {

  _module.controller("Wiki.CommitController", ["$scope", "$location", "$routeParams", "$templateCache", "workspace", "marked", "fileExtensionTypeRegistry", "wikiRepository", "jolokia", ($scope, $location, $routeParams, $templateCache, workspace:Workspace, marked, fileExtensionTypeRegistry, wikiRepository:GitWikiRepository, jolokia) => {

    var isFmc = Fabric.isFMCContainer(workspace);

    Wiki.initScope($scope, $routeParams, $location);
    $scope.commitId = $scope.objectId;
    $scope.selectedItems = [];

    // TODO we could configure this?
    $scope.dateFormat = 'EEE, MMM d, y : hh:mm:ss a';

    $scope.gridOptions = {
      data: 'commits',
      showFilter: false,
      multiSelect: false,
      selectWithCheckboxOnly: true,
      showSelectionCheckbox: true,
      displaySelectionCheckbox : true, // old pre 2.0 config!
      selectedItems: $scope.selectedItems,
      filterOptions: {
        filterText: ''
      },
      columnDefs: [
        {
          field: 'path',
          displayName: 'File Name',
          cellTemplate: $templateCache.get('fileCellTemplate.html'),
          width: "***",
          cellFilter: ""
        },
      ]
    };

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateView, 50);
    });

    $scope.$watch('workspace.tree', function () {
      if (!$scope.git && Git.getGitMBean(workspace)) {
        // lets do this asynchronously to avoid Error: $digest already in progress
        //console.log("Reloading the view as we now seem to have a git mbean!");
        setTimeout(updateView, 50);
      }
    });


    $scope.canRevert = () => {
      return $scope.selectedItems.length === 1;
    };

    $scope.revert = () => {
      if ($scope.selectedItems.length > 0) {
        var path = commitPath($scope.selectedItems[0]);
        var objectId = $scope.commitId;
        if (path && objectId) {
          var commitMessage = "Reverting file " + $scope.pageId + " to previous version " + objectId;
          wikiRepository.revertTo($scope.branch, objectId, $scope.pageId, commitMessage, (result) => {
            Wiki.onComplete(result);
            // now lets update the view
            updateView();
          });
        }
      }
    };

    function commitPath(commit) {
      return commit.path || commit.name;
    }

    $scope.diff = () => {
      if ($scope.selectedItems.length > 0) {
        var commit = $scope.selectedItems[0];
        /*
         var commit = row;
         var entity = row.entity;
         if (entity) {
         commit = entity;
         }
         */
        var link = startLink($scope.branch) + "/diff/" + commitPath(commit) + "/" + $scope.commitId + "/";
        var path = Core.trimLeading(link, "#");
        $location.path(path);
      }
    };

    updateView();

    function updateView() {
      var commitId = $scope.commitId;

      Wiki.loadBranches(jolokia, wikiRepository, $scope, isFmc);

      wikiRepository.commitInfo(commitId, (commitInfo) => {
        $scope.commitInfo = commitInfo;
        Core.$apply($scope);
      });

      wikiRepository.commitTree(commitId, (commits) => {
        $scope.commits = commits;
        angular.forEach(commits, (commit) => {
          commit.fileIconHtml = Wiki.fileIconHtml(commit);
          commit.fileClass = commit.name.endsWith(".profile") ? "green" : "";
          var changeType = commit.changeType;
          var path = commitPath(commit);
          if (path) {
            commit.fileLink = startLink($scope.branch) + '/version/' + path + '/' + commitId;
          }
          if (changeType) {
            changeType = changeType.toLowerCase();
            if (changeType.startsWith("a")) {
              commit.changeClass = "change-add";
              commit.change = "add";
              commit.title = "added";
            } else if (changeType.startsWith("d")) {
              commit.changeClass = "change-delete";
              commit.change = "delete";
              commit.title = "deleted";
              commit.fileLink = null;
            } else {
              commit.changeClass = "change-modify";
              commit.change = "modify";
              commit.title = "modified";
            }
            commit.changeTypeHtml = '<span class="' + commit.changeClass + '">' + commit.title + '</span>';
          }
        });
        Core.$apply($scope);
      });
    }
  }]);
}
