module Core {

  export class ConfirmDialog {
    public restrict = 'A';
    public replace = true;
    public transclude = true;
    public templateUrl = 'app/core/html/confirmDialog.html';

    public scope = {
      show: '=hawtioConfirmDialog',
      title: '@',
      okButtonText: '@',
      cancelButtonText: '@',
      onCancel: '&',
      onOk: '&',
      onClose: '&'
    }

    public controller = ($scope, $element, $attrs, $transclude, $compile) => {

      $scope.clone = null;

      $transclude(function(clone) {
        $scope.clone = $(clone).filter('.dialog-body');
      });

      $scope.$watch('show', function() {
        if ($scope.show) {
          setTimeout(function() {
            $scope.body = $('.modal-body');
            $scope.body.html($compile($scope.clone.html())($scope.$parent));
          }, 50);
        }
      });

      $attrs.$observe('okButtonText', function(value) {
        if (!angular.isDefined(value)) {
          $scope.okButtonText = "Ok";
        }
      });
      $attrs.$observe('cancelButtonText', function(value) {
        if (!angular.isDefined(value)) {
          $scope.cancelButtonText = "Cancel";
        }
      });
      $attrs.$observe('title', function(value) {
        if (!angular.isDefined(value)) {
          $scope.title = "Are you sure?";
        }
      });

      $scope.cancel = () => {
        $scope.show = false;
        $scope.$parent.$eval($scope.onCancel);
      }

      $scope.submit = () => {
        $scope.show = false;
        $scope.$parent.$eval($scope.onOk);
      }

      $scope.close = () => {
        $scope.$parent.$eval($scope.onClose);
      }

    }

    public constructor () {

    }

  }

}
