module UI {

  export function UITestController($scope, workspace) {

    $scope.showDeleteOne = false;
    $scope.showDeleteTwo = false;

    $scope.onCancelled = (number) => {
      notification('info', 'cancelled ' + number);
    }

    $scope.onOk = (number) => {
      notification('info', number + ' ok!');
    }


  }

}
