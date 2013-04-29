module Core {

  export class ConfirmDialog {
    public restrict = 'EA';
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

    public controller = ($scope, $element, $attrs) => {

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

    // see constructor for why this is here...
    public compile:(tElement, tAttrs, transclude) => any;

    constructor() {
      this.compile = (tElement, tAttrs, transclude) => {
        return this.doCompile(tElement, tAttrs, transclude);
      }

    }

    private doCompile(tElement, tAttrs, transclude) {
      return (scope, element, attrs) => {
        transclude(scope, function(clone) {
          var modalBody = element.find('.modal-body');
          modalBody.append(clone);
        });
      }
    }

  }

}
