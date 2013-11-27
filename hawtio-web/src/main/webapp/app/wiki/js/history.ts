/**
 * @module Wiki
 */
module Wiki {

  export function HistoryController($scope, $location, $routeParams, $templateCache,
                                    workspace:Workspace, marked, fileExtensionTypeRegistry, wikiRepository:GitWikiRepository) {

    Wiki.initScope($scope, $routeParams, $location);
    $scope.selectedItems = [];

    // TODO we could configure this?
    $scope.dateFormat = 'EEE, MMM d, y : hh:mm:ss a';

    $scope.gridOptions = {
      data: 'logs',
      showFilter: false,
      selectedItems: $scope.selectedItems,
      showSelectionCheckbox: true,
      displaySelectionCheckbox : true, // old pre 2.0 config!
      filterOptions: {
        filterText: ''
      },
      columnDefs: [
        {
          field: 'commitHashText',
          displayName: 'Change',
          cellTemplate: $templateCache.get('changeCellTemplate.html'),
          cellFilter: "",
          width: "*"
        },
        {
          field: 'date',
          displayName: 'Modified',
          cellFilter: "date: dateFormat",
          width: "**"
        },
        {
          field: 'author',
          displayName: 'Author',
          cellFilter: "",
          width: "**"
        },
        {
          field: 'shortMessage',
          displayName: 'Message',
          cellTemplate: '<div class="ngCellText" title="{{row.entity.shortMessage}}">{{row.entity.trimmedMessage}}</div>',
          cellFilter: "",
          width: "****"
        }
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
      return $scope.selectedItems.length === 1 && $scope.selectedItems[0] !== $scope.logs[0];
    };

    $scope.revert = () => {
      if ($scope.selectedItems.length > 0) {
        var objectId = $scope.selectedItems[0].name;
        if (objectId) {
          var commitMessage = "Reverting file " + $scope.pageId + " to previous version " + objectId;
          wikiRepository.revertTo(objectId, $scope.pageId, commitMessage, (result) => {
            Wiki.onComplete(result);
            // now lets update the view
            updateView();
          });
        }
      }
    };

    $scope.diff = () => {
      var defaultValue = " ";
      var objectId = defaultValue;
      if ($scope.selectedItems.length > 0) {
        objectId = $scope.selectedItems[0].name || defaultValue;
      }
      var baseObjectId = defaultValue;
      if ($scope.selectedItems.length > 1) {
        baseObjectId = $scope.selectedItems[1].name ||defaultValue;
      }
      var link = startLink($scope.branch) + "/diff/" + $scope.pageId + "/" + objectId + "/" + baseObjectId;
      var path = Core.trimLeading(link, "#");
      $location.path(path);
    };

    updateView();

    function updateView() {
      var objectId = "";
      var limit = 0;

      $scope.git = wikiRepository.history($scope.branch, objectId, $scope.pageId, limit, (logArray) => {
        angular.forEach(logArray, (log) => {
          // lets use the shorter hash for links by default
          var commitId = log.commitHashText || log.name;
          log.commitLink = startLink($scope.branch) + "/commit/" + $scope.pageId + "/" + commitId;
        });
        $scope.logs = logArray;
        Core.$apply($scope);
      });
      Wiki.loadBranches(wikiRepository, $scope);
    }
  }
}
