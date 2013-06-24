module UI {

  export var fileUploadMBean = "io.hawt.jmx:type=UploadManager";

  export class FileUpload {

    public restrict = 'A';
    public replace = true;

    public templateUrl = UI.templatePath + "fileUpload.html";

    public controller = ($scope, $element, $attrs, jolokia) => {

      $scope.files = [];

      $scope.update = (response) => {
        $scope.files = response.value;
        $scope.$apply();
      }

      Core.register(jolokia, $scope, {
        type: 'exec', mbean: fileUploadMBean,
        operation: 'list(java.lang.String)',
        arguments: [null]
      }, onSuccess($scope.update));

    };


  }
}
