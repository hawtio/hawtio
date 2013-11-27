/**
 * @module UI
 */
module UI {

  export class EditableProperty {

    public restrict = 'E';
    public scope = true;
    public templateUrl = UI.templatePath + 'editableProperty.html';
    public require = 'ngModel';
    public link = null;

    constructor(private $parse) {

      this.link = (scope, element, attrs, ngModel) => {
        scope.editing = false;
        $(element.find(".icon-pencil")[0]).hide();

        scope.getPropertyName = () => {
          var propertyName = $parse(attrs['property'])(scope);
          if (!propertyName && propertyName !== 0) {
            propertyName = attrs['property'];
          }
          return propertyName;
        }

        scope.propertyName = scope.getPropertyName();

        ngModel.$render = function () {
          if (!ngModel.$viewValue) {
            return;
          }
          scope.text = ngModel.$viewValue[scope.propertyName];
        };

        scope.showEdit = function () {
          $(element.find(".icon-pencil")[0]).show();
        };

        scope.hideEdit = function () {
          $(element.find(".icon-pencil")[0]).hide();
        };

        scope.$watch('editing', (newValue, oldValue) => {
          if (newValue !== oldValue) {
            if (newValue) {
              $(element.find('input[type=text]')).focus();
            }
          }
        });

        scope.doEdit = function () {
          scope.editing = true;
        };

        scope.stopEdit = function () {
          scope.editing = false;
        };

        scope.saveEdit = function () {
          var value = $(element.find(":input[type=text]")[0]).val();
          var obj = ngModel.$viewValue;

          obj[scope.propertyName] = value;

          ngModel.$setViewValue(obj);
          ngModel.$render();
          scope.editing = false;
          scope.$parent.$eval(attrs['onSave']);
        };

      };
    }

  }


}
