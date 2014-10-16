/// <reference path="dockerRegistryPlugin.ts"/>
/// <reference path="../../ui/js/dialog.ts"/>
module DockerRegistry {

  export var TagController = controller("TagController", ["$scope", ($scope) => {
    $scope.selectImage = (imageID:string) => {
      $scope.$emit("DockerRegistry.SelectedImageID", imageID);
    }
  }]);

  export var ListController = controller("ListController", ["$scope", "$templateCache", "$http", ($scope, $templateCache:ng.ITemplateCacheService, $http:ng.IHttpService) => {

    $scope.imageRepositories = [];
    $scope.selectedImage = undefined;

    $scope.tableConfig = {
      data: 'imageRepositories',
      showSelectionCheckbox: true,
      enableRowClickSelection: false,
      multiSelect: true,
      selectedItems: [],
      filterOptions: {
        filterText: ''
      },
      columnDefs: [
        { field: 'name', displayName: 'Name', defaultSort: true },
        { field: 'description', displayName: 'Description' },
        { field: 'tags', displayName: 'Tags', cellTemplate: $templateCache.get("tagsTemplate.html") }
      ]
    }

    $scope.deletePrompt = (selectedRepositories:Array<DockerImageRepository>) => {
      UI.multiItemConfirmActionDialog(<UI.MultiItemConfirmActionOptions> {
        collection: selectedRepositories,
        index: 'name',
        onClose: (result: boolean) => {
          if (result) {
            selectedRepositories.forEach((repository) => {
              var deleteURL = UrlHelpers.join($scope.restURL, '/v1/repositories/' + repository.name + '/');
              log.debug("Using URL: " , deleteURL);
              $http.delete(deleteURL).success((data) => {
                log.debug("Deleted repository: ", repository.name);  
              }).error((data) => {
                log.debug("Failed to delete repository: ", repository.name);
              });
            });
          }
        },
        title: 'Delete Repositories?',
        action: 'The following repositories will be deleted:',
        okText: 'Delete',
        okClass: 'btn-danger',
        custom: 'This operation is permanent once completed!',
        customClass: 'alert alert-warning'
      }).open();
    };

    $scope.$on("DockerRegistry.SelectedImageID", ($event, imageID) => {
      var imageJsonURL = UrlHelpers.join($scope.restURL, '/v1/images/' + imageID + '/json');
      $http.get(imageJsonURL).success((image) => {
        log.debug("Got image: ", image);
        $scope.selectedImage = image;
      });
    });

    $scope.$on('DockerRegistry.Repositories', ($event, restURL:string, repositories:DockerImageRepositories) => {

      $scope.imageRepositories = repositories;
    });
  }]);
}
