module UI {

  export var fileUploadMBean = "io.hawt.jmx:type=UploadManager";

  export class FileUpload {

    public restrict = 'A';
    public replace = true;

    public templateUrl = UI.templatePath + "fileUpload.html";

    public scope = {
      target: '@hawtioFilePlugin'
    };


    public controller = ($scope, $element, $attrs, jolokia) => {

      $scope.files = [];
      $scope.target = '';

      $scope.update = (response) => {
        $scope.files = response.value;
        $scope.$apply();
      }

      Core.register(jolokia, $scope, {
        type: 'exec', mbean: fileUploadMBean,
        operation: 'list(java.lang.String)',
        arguments: [null]
      }, onSuccess($scope.update));

      $scope.onFileChange = () => {
        console.log("File changed!");
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
