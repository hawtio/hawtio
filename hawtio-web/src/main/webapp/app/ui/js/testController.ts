module UI {

  export function UITestController($scope, workspace) {

    $scope.showDeleteOne = false;
    $scope.showDeleteTwo = false;

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


  }

}
