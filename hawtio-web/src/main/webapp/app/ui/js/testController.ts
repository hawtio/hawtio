module UI {

  export function UITestController($scope, workspace) {

    $scope.showDeleteOne = new Core.Dialog();
    $scope.showDeleteTwo = new Core.Dialog();

    $scope.fileUploadEx1 = '<div hawtio-file-upload="files" target="patches"></div>';
    $scope.fileUploadEx2 = '<div hawtio-file-upload="files" target="test" show-files="false"></div>';
    $scope.fileUploadExMode = 'text/html';

    $scope.colorPickerEx = 'My Color ({{myColor}}): <div hawtio-color-picker="myColor"></div>';

    $scope.confirmationEx1 = '' +
        '<button class="btn" ng-click="showDeleteOne.open()">Delete Stuff</button>\n' +
        '\n' +
        '<div hawtio-confirm-dialog="showDeleteOne.show"\n' +
        'title="Delete Stuff?"\n' +
        'ok-button-text="Yes, Delete the Stuff"\n' +
        'cancel-button-text="No, Keep the Stuff"\n' +
        'on-cancel="onCancelled(\'One\')"\n' +
        'on-ok="onOk(\'One\')">\n'  +
        '  <div class="dialog-body">\n' +
        '    <p>\n' +
        '        Are you sure you want to delete all the stuff?\n' +
        '    </p>\n' +
        '  </div>\n' +
        '</div>\n';

    $scope.confirmationEx2 = '' +
        '<button class="btn" ng-click="showDeleteTwo.open()">Delete Other Stuff</button>\n' +
        '\n' +
        '<!-- Use more defaults -->\n' +
        '<div hawtio-confirm-dialog="showDeleteTwo.show\n"' +
        '  on-cancel="onCancelled(\'Two\')"\n' +
        '  on-ok="onOk(\'Two\')">\n' +
        '  <div class="dialog-body">\n' +
        '    <p>\n' +
        '      Are you sure you want to delete all the other stuff?\n' +
        '    </p>\n' +
        '  </div>\n' +
        '</div>';


    $scope.transcludedValue = "and this is transcluded";

    $scope.onCancelled = (number) => {
      notification('info', 'cancelled ' + number);
    }

    $scope.onOk = (number) => {
      notification('info', number + ' ok!');
    }

    $scope.showSlideoutRight = false;
    $scope.showSlideoutLeft = false;

    $scope.dirty = false;
    $scope.mode = 'javascript';

    $scope.someText = "var someValue = 0;\n" +
                      "var someFunc = function() {\n" +
                      "  return \"Hello World!\";\n" +
                      "}\n";


    $scope.myColor = "#FF887C";
    $scope.showColorDialog = false;

    $scope.files = [];

    $scope.$watch('files', (newValue, oldValue) => {
      if (newValue !== oldValue) {
        console.log("Files: ", $scope.files);
      }
    }, true);


  }

}
