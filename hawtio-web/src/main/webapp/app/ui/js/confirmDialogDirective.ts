module UI {

  export class ConfirmDialog {
    public restrict = 'A';
    public replace = true;
    public transclude = true;
    public templateUrl = UI.templatePath + 'confirmDialog.html';

    public scope = {
      show: '=hawtioConfirmDialog',
      title: '@',
      okButtonText: '@',
      cancelButtonText: '@',
      onCancel: '&',
      onOk: '&',
      onClose: '&'
    };

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
            Core.$apply($scope);
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

      function checkClosed() {
        setTimeout(() => {
          // lets make sure we don't have a modal-backdrop hanging around!
          var backdrop = $("div.modal-backdrop");
          if (backdrop && backdrop.length) {
            Logger.get("ConfirmDialog").info("Removing the backdrop div! " + backdrop);
            backdrop.remove();
          }
        }, 200);
      }

      $scope.cancel = () => {
        $scope.show = false;
        $scope.$parent.$eval($scope.onCancel);
        checkClosed();
      };

      $scope.submit = () => {
        $scope.show = false;
        $scope.$parent.$eval($scope.onOk);
        checkClosed();
      };

      $scope.close = () => {
        $scope.$parent.$eval($scope.onClose);
        checkClosed();
      };

    };

    public constructor () {

    }

  }

}
