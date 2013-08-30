module Wiki {

  export class FileList {
    public restrict = 'A';
    public replace = true;
    public templateUrl = Wiki.templatePath + 'filelist.html';

    public scope = {
      branch: '@',
      pageId: '@',
      caption: '@'
    };

    public controller = ($scope, $location, $routeParams, $http, $timeout, workspace:Workspace, marked, fileExtensionTypeRegistry, wikiRepository:GitWikiRepository, $compile) => {

      $scope.nameOnly = true;

      Wiki.ViewController($scope, $location, $routeParams, $http, $timeout, workspace, marked, fileExtensionTypeRegistry, wikiRepository, $compile);

    };

    public link = ($scope, $element, $attrs) => {

      $scope.$watch('branch', (oldValue, newValue) => {
        setTimeout(() => {
          $scope.updateView();
          Core.$apply($scope);
        }, 50);
      });

      $scope.$watch('pageId', (oldValue, newValue) => {
        setTimeout(() => {
          $scope.updateView();
          Core.$apply($scope);
        }, 50);
      });

      $scope.branch = $attrs['branch'];
      $scope.pageId = $attrs['pageId'];
      $scope.caption = $attrs['caption'];
    };

  }

}
