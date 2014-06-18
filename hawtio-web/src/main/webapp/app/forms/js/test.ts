///<reference path="formPlugin.ts"/>
module Forms {

  export var FormTestController = _module.controller("Forms.FormTestController", ["$scope", ($scope) => {

    $scope.editing = false;

    $scope.html = "text/html";
    $scope.javascript = "javascript";

    $scope.basicFormEx1Entity = {
      'key': 'Some key',
      'value': 'Some value'
    };
    $scope.basicFormEx1EntityString = angular.toJson($scope.basicFormEx1Entity, true);

    $scope.basicFormEx1Result = '';

    $scope.toggleEdit = function() {
      $scope.editing = !$scope.editing;
    };

    $scope.view = function() {
      if (!$scope.editing) {
        return "view";
      }
      return "edit";
    };

    $scope.basicFormEx1 = '<div simple-form name="some-form" action="#/forms/test" method="post" data="basicFormEx1SchemaObject" entity="basicFormEx1Entity" onSubmit="callThis()"></div>';

    $scope.toObject = (str) => {
      return angular.fromJson(str.replace("'", "\""));
    };

    $scope.fromObject = (str) => {
      return angular.toJson($scope[str], true);
    };

    //TODO - I totally did this backwards :-/
    $scope.basicFormEx1Schema = '' +
        '{\n' +
        '   "properties": {\n' +
        '     "key": {\n' +
        '       "description": "Argument key",\n' +
        '       "type": "java.lang.String"\n' +
        '     },\n' +
        '     "value": {\n' +
        '       "description": "Argument Value",\n' +
        '       "type": "java.lang.String"\n' +
        '     },\n' +
        '     "longArg": {\n' +
        '       "description": "Long argument",\n' +
        '       "type": "Long",\n' +
        '       "minimum": "5",\n' +
        '       "maximum": "10"\n' +
        '     },\n' +
        '     "intArg": {\n' +
        '       "description": "Int argument",\n' +
        '       "type": "Integer"\n' +
        '     },\n' +
        '     "objectArg": {\n' +
        '       "description": "some object",\n' +
        '       "type": "object"\n' +
        '     },\n' +
        '     "booleanArg": {\n' +
        '       "description": "Some boolean value",\n' +
        '       "type": "java.lang.Boolean"\n' +
        '     }\n' +
        '   },\n' +
        '   "description": "Show some stuff in a form",\n' +
        '   "type": "java.lang.String",\n' +
        '   "tabs": {\n' +
        '     "Tab One": ["key", "value"],\n' +
        '     "Tab Two": ["*"],\n' +
        '     "Tab Three": ["booleanArg"]\n' +
        '   }\n' +
        '}';

    $scope.basicFormEx1SchemaObject = $scope.toObject($scope.basicFormEx1Schema);

    $scope.updateSchema = () => {
      $scope.basicFormEx1SchemaObject = $scope.toObject($scope.basicFormEx1Schema);
    };

    $scope.updateEntity = () => {
      $scope.basicFormEx1Entity = angular.fromJson($scope.basicFormEx1EntityString);
    };

    $scope.hawtioResetEx = '<a class="btn" href="" hawtio-reset="some-form"><i class="icon-refresh"></i> Clear</a>';

    $scope.hawtioSubmitEx = '      <a class="btn" href="" hawtio-submit="some-form"><i class="icon-save"></i> Save</a>';

    $scope.callThis = (json, form) => {
      $scope.basicFormEx1Result = angular.toJson(json, true);
      notification('success', 'Form "' + form.get(0).name + '" submitted...');
      Core.$apply($scope);
    };

    $scope.config = {
      name: 'form-with-config-object',
      action: "/some/url",
      method: "post",
      data: 'setVMOption',
      showtypes: 'false'
    };

    $scope.cheese = {
      key: "keyABC",
      value: "valueDEF",
      intArg: 999
    };

    $scope.onCancel = (form) => {
      notification('success', 'Cancel clicked on form "' + form.get(0).name + '"');
    };

    $scope.onSubmit = (json, form) => {
      notification('success', 'Form "' + form.get(0).name + '" submitted... (well not really), data:' + JSON.stringify(json));
    };

    $scope.derp = (json, form) => {
      notification('error', 'derp with json ' + JSON.stringify(json));
    };

    $scope.inputTableData = {
      rows: [
        { id: "object1", name: 'foo' },
        { id: "object2", name: 'bar' }
      ]
    };

    $scope.inputTableConfig = {
      data: 'inputTableData.rows',
      displayFooter: false,
      showFilter: false,
      properties: {
        'rows': { items: { type: 'string', properties: {
          'id': {
            description: 'Object ID',
            type: 'java.lang.String'
          },
          'name': {
            description: 'Object Name',
            type: 'java.lang.String'
          }
        } } }
      },
      columnDefs: [
        {
          field: 'id',
          displayName: 'ID'
        },
        {
          field: 'name',
          displayName: 'Name'
        }

      ]
    };
  }]);

}
