module Wiki {

  export function HistoryController($scope, $location, $routeParams, workspace:Workspace, marked, fileExtensionTypeRegistry, wikiRepository:GitWikiRepository) {

    $scope.pageId = Wiki.pageId($routeParams, $location);
    $scope.selectedItems = [];
    $scope.searchText = "";

    // TODO we could configure this?
    $scope.dateFormat = 'EEE, MMM d, y : hh:mm:ss a';

    $scope.gridOptions = {
      data: 'logs',
      showFilter: false,
      selectedItems: $scope.selectedItems,
      filterOptions: {
        filterText: "searchText"
      },
      columnDefs: [
        {
          field: 'commitHashText',
          displayName: 'Version',
          cellTemplate: '<div class="ngCellText"><a ng-href="#/wiki/version/{{pageId}}/{{row.getProperty(' + "'name'" + ')}}{{hash}}">{{row.getProperty(col.field)}}</a></div>',
          cellFilter: ""
        },
        {
          field: 'date',
          displayName: 'Modified',
          cellFilter: "date: dateFormat"
        },
        {
          field: 'author',
          displayName: 'Author',
          cellFilter: ""
        },
        {
          field: 'shortMessage',
          displayName: 'Message',
          cellFilter: ""
        }
      ]
    };

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateView, 50);
    });

    $scope.canRevert = () => {
      return $scope.selectedItems.length === 1 && $scope.selectedItems[0] !== $scope.logs[0];
    };

    updateView();

    function updateView() {
      var objectId = "";
      //var limit = 0;
      var limit = 0;
      var pageOffset = 0;
      //var showRemoteRefs = false;
      var showRemoteRefs = false;
      var itemsPerPage = 0;

      wikiRepository.history(objectId, $scope.pageId, limit, pageOffset, showRemoteRefs, itemsPerPage, (logArray) => {
        $scope.logs = logArray;
        Core.$apply($scope);
      });
    }
  }
}