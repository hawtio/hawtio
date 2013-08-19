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

        ngModel.$render = function () {
          var propertyName = $parse(attrs['property'])(scope);
          scope.text = ngModel.$viewValue[propertyName];
        };

        scope.showEdit = function () {
          $(element.find(".icon-pencil")[0]).show();
        };

        scope.hideEdit = function () {
          $(element.find(".icon-pencil")[0]).hide();
        };

        scope.doEdit = function () {
          scope.editing = true;
        };

        scope.stopEdit = function () {
          scope.editing = false;
        };

        scope.saveEdit = function () {
          var value = $(element.find(":input[type=text]")[0]).val();
          var obj = ngModel.$viewValue;

          obj[$parse(attrs['property'])(scope)] = value;

          ngModel.$setViewValue(obj);
          ngModel.$render();
          scope.editing = false;
          scope.$parent.$eval(attrs['onSave']);
        };

      };
    }

  }


}
