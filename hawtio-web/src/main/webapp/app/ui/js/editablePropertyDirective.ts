/**
 * @module UI
 */
/// <reference path="../../helpers/js/stringHelpers.ts"/>
/// <reference path="uiPlugin.ts"/>
module UI {

  _module.directive('editableProperty', ["$parse", ($parse) => {
    return new UI.EditableProperty($parse);
  }]);

  export class EditableProperty {

    public restrict = 'E';
    public scope = true;
    public templateUrl = UI.templatePath + 'editableProperty.html';
    public require = 'ngModel';
    public link:any = null;

    constructor(private $parse) {

      this.link = (scope, element, attrs, ngModel) => {

        scope.inputType = attrs['type'] || 'text';
        scope.min = attrs['min'];
        scope.max = attrs['max'];

        scope.getText = () => {
          if (!scope.text) {
            return '';
          }
          if (scope.inputType === 'password') {
            return StringHelpers.obfusicate(scope.text);
          } else {
            return scope.text;
          }
        };

        scope.editing = false;
        (<JQueryStatic>$)(element.find(".icon-pencil")[0]).hide();

        scope.getPropertyName = () => {
          var propertyName = $parse(attrs['property'])(scope);
          if (!propertyName && propertyName !== 0) {
            propertyName = attrs['property'];
          }
          return propertyName;
        };

        ngModel.$render = function () {
          if (!ngModel.$viewValue) {
            return;
          }
          scope.text = ngModel.$viewValue[scope.getPropertyName()];
        };

        scope.getInputStyle = () => {
          if (!scope.text) {
            return {};
          }
          var calculatedWidth = (scope.text + "").length / 1.2;
          if (calculatedWidth < 5) {
            calculatedWidth = 5;
          }
          return {
            width: calculatedWidth + 'em'
          }
        };

        scope.showEdit = function () {
          (<JQueryStatic>$)(element.find(".icon-pencil")[0]).show();
        };

        scope.hideEdit = function () {
          (<JQueryStatic>$)(element.find(".icon-pencil")[0]).hide();
        };

        function inputSelector() {
          return ':input[type=' + scope.inputType + ']';
        }

        scope.$watch('editing', (newValue, oldValue) => {
          if (newValue !== oldValue) {
            if (newValue) {
              (<JQueryStatic>$)(element.find(inputSelector())).focus().select();
            }
          }
        });

        scope.doEdit = function () {
          scope.editing = true;
        };

        scope.stopEdit = function () {
          (<JQueryStatic>$)(element.find(inputSelector())[0]).val(ngModel.$viewValue[scope.getPropertyName()]);
          scope.editing = false;
        };

        scope.saveEdit = function () {
          var value = (<JQueryStatic>$)(element.find(inputSelector())[0]).val();
          var obj = ngModel.$viewValue;

          obj[scope.getPropertyName()] = value;

          ngModel.$setViewValue(obj);
          ngModel.$render();
          scope.editing = false;
          scope.$parent.$eval(attrs['onSave']);
        };

      };
    }

  }


}
