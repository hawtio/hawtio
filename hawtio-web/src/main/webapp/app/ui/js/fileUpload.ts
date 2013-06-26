module UI {

  export var fileUploadMBean = "io.hawt.jmx:type=UploadManager";

  export class FileUpload {

    public restrict = 'A';
    public replace = true;

    public templateUrl = UI.templatePath + "fileUpload.html";

    public scope = {
      files: '=hawtioFileUpload',
      target: '@',
      showFiles: '@'
    };


    public controller = ($scope, $element, $attrs, jolokia) => {

      $scope.target = '';
      $scope.response = '';
      $scope.percentComplete = 0;

      observe($scope, $attrs, 'target', '');
      observe($scope, $attrs, 'showFiles', true);


      $scope.update = (response) => {
        var responseJson = angular.toJson(response.value);
        if ($scope.responseJson !== responseJson) {
          $scope.responseJson = responseJson;
          $scope.files = response.value;
          $scope.$apply();
        }
      }


      $scope.delete = (fileName) => {
        //notification('info', 'Deleting ' + fileName);
        jolokia.request({
          type: 'exec', mbean: fileUploadMBean,
          operation: 'delete(java.lang.String, java.lang.String)',
          arguments: [$scope.target, fileName]}, {
          success: () => {
            //notification('success', 'Deleted ' + fileName);
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

    };


    public link = ($scope, $element, $attrs) => {

      var fileInput = $element.find('input[type=file]');
      var form = $element.find('form[name=file-upload]');
      var button = $element.find('input[type=button]');

      var onFileChange = () => {

        button.prop('disabled', true);

        var files = fileInput.get(0).files;

        var fileName = files.length + " files";
        if (files.length ===1) {
          fileName = files[0].name;
        }

        form.ajaxSubmit({
          beforeSubmit: (arr, $form, options) => {
            notification('info', "Uploading " + fileName);
            $scope.percentComplete = 0;
            $scope.$apply();
          },
          success: (response, statusText, xhr, $form) => {
            notification('success', "Uploaded " + fileName);
            button.prop('disabled', false);
            $scope.percentComplete = 0;
            $scope.$apply();
          },
          error: (response, statusText, xhr, $form) => {
            notification('error', "Failed to upload " + fileName + " due to " + statusText);
            button.prop('disabled', false);
            $scope.percentComplete = 0;
            $scope.$apply();
          },
          uploadProgress: (event, position, total, percentComplete) => {
            $scope.percentComplete = percentComplete;
            $scope.$apply();
          }
        });
        return false;
      }

      button.click(() => {
        if (!button.prop('disabled')) {
          fileInput.click();
        }
        return false;
      });

      form.submit(() => {
        return false;
      });

      if ($.browser.msie) {
        fileInput.click((event) => {
          setTimeout(() => {
            if (fileInput.val().length > 0) {
              onFileChange();
            }
          }, 0);
        })
      } else {
        fileInput.change(onFileChange);
      }


    };


  }
}
