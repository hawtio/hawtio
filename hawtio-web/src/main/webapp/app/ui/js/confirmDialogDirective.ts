/**
 * @module UI
 */
/// <reference path="./uiPlugin.ts"/>
module UI {

  _module.directive('hawtioConfirmDialog', () => {
    return new UI.ConfirmDialog();
  });

  /**
   * Configuration object for the ConfirmDialog directive
   * @class ConfirmDialogConfig
   */
  export interface ConfirmDialogConfig {
    /**
     * Model used to open/close the dialog
     *
     * @property hawtioConfirmDialog
     * @type String
     */
    show: string;
    /**
     * Sets the title of the dialog
     *
     * @property title
     * @type String
     */
    title: string;
    /**
     * Sets the text used on the dialogs "OK" button
     *
     * @property okButtonText
     * @type String
     */
    okButtonText: string;
    /**
     * Whether to show the ok button
     *
     * @property showOkButton
     * @type boolean
     */
    showOkButton: string;
    /**
     * Sets the text used on the dialog's "Cancel" button
     *
     * @property cancelButtonText
     * @type String
     */
    cancelButtonText: string;
    /**
     * callback function that's called when the dialog has been cancelled
     *
     * @property onCancel
     * @type String
     */
    onCancel: string;
    /**
     * Callback function that's called when the user has clicked "OK"
     *
     * @property onOk
     * @type String
     */
    onOk: string;
    /**
     * Callback function when the dialog has been closed either way
     *
     * @property onClose
     * @type String
     */
    onClose: string;
  }

  /**
   * Directive that opens a simple standard confirmation dialog.  See ConfigDialogConfig
   * for configuration properties
   *
   * @class ConfirmDialog
   */
  export class ConfirmDialog {
    public restrict = 'A';
    public replace = true;
    public transclude = true;
    public templateUrl = UI.templatePath + 'confirmDialog.html';

    /**
     * @property scope
     * @type ConfirmDialogConfig
     */
    public scope:ConfirmDialogConfig = {
      show: '=hawtioConfirmDialog',
      title: '@',
      okButtonText: '@',
      showOkButton: '@',
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
          $scope.okButtonText = "OK";
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
            Logger.get("ConfirmDialog").debug("Removing the backdrop div! " + backdrop);
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
