module UI {

  export var fileUploadMBean = "io.hawt.jmx:type=UploadManager";

  export class FileUpload {

    public restrict = 'A';
    public replace = true;

    public templateUrl = UI.templatePath + "fileUpload.html";

    public scope = {
      files: '=hawtioFileUpload',
      target: '@'
    };


    public controller = ($scope, $element, $attrs, jolokia) => {

      $scope.target = '';

      observe($scope, $attrs, 'target', '');

      $scope.update = (response) => {
        $scope.files = response.value;
        $scope.$apply();
      }

      $scope.delete = (fileName) => {
        jolokia.request({
          type: 'exec', mbean: fileUploadMBean,
          operation: 'delete(java.lang.String, java.lang.String)',
          arguments: [$scope.target, fileName],
          success: () => {
            $scope.$apply();
          },
          error: (response) => {
            notification('error', "Failed to delete " + fileName + " due to: " + response.error);
            $scope.$apply();
          }
        });
      }


      $scope.$watch('target', (newValue, oldValue) => {
        if (oldValue !== newValue) {
          Core.unregister(jolokia, $scope);
        }
        Core.register(jolokia, $scope, {
          type: 'exec', mbean: fileUploadMBean,
          operation: 'list(java.lang.String)',
          arguments: [$scope.target]
        }, onSuccess($scope.update));

      });


      $scope.onFileChange = () => {
        var form:any = $('form[name=file-upload]');
        form.ajaxSubmit({});
        return false;
      }

    };


    public link = ($scope, $element, $attrs) => {

      var fileInput = $element.find('input[type=file]');
      var form = $element.find('form[name=file-upload]');

      form.submit(() => {
        return false;
      });

      if ($.browser.msie) {
        fileInput.click((event) => {
          setTimeout(() => {
            if (fileInput.val().length > 0) {
              $scope.onFileChange();
            }
          }, 0);
        })
      } else {
        fileInput.change($scope.onFileChange);
      }


    };


  }
}
