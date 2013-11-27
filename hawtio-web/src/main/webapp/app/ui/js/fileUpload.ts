/**
 * @module UI
 */
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
          Core.$applyNowOrLater($scope);
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
            Core.$apply($scope);
          },
          error: (response) => {
            notification('error', "Failed to delete " + fileName + " due to: " + response.error);
            Core.$apply($scope);
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
            Core.$apply($scope);
          },
          success: (response, statusText, xhr, $form) => {
            notification('success', "Uploaded " + fileName);
            setTimeout( () => {
              button.prop('disabled', false);
              $scope.percentComplete = 0;
              Core.$apply($scope);
            }, 1000);
            Core.$apply($scope);
          },
          error: (response, statusText, xhr, $form) => {
            notification('error', "Failed to upload " + fileName + " due to " + statusText);
            setTimeout( () => {
              button.prop('disabled', false);
              $scope.percentComplete = 0;
              Core.$apply($scope);
            }, 1000);
            Core.$apply($scope);
          },
          uploadProgress: (event, position, total, percentComplete) => {
            $scope.percentComplete = percentComplete;
            Core.$apply($scope);
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

      if ((<any>$).browser.msie) {
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
