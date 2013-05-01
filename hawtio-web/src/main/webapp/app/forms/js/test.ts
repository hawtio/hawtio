module Forms {

  export function FormTestController($scope, workspace) {

    $scope.editing = false;

    $scope.toggleEdit = function() {
      $scope.editing = !$scope.editing;
    };

    $scope.view = function() {
      if (!$scope.editing) {
        return "view";
      }
      return "edit";
    }

    $scope.setVMOption = {
      properties: {
        'key': {
          description: 'Argument key',
          type: 'java.lang.String'
        },
        'value': {
          description: 'Argument Value',
          type: 'java.lang.String'
        },
        'longArg': {
          description: 'Long argument',
          type: 'Long',
          minimum: '5',
          maximum: '10'
        },
        'intArg': {
          description: 'Int argument',
          type: 'Integer'
        },
        'objectArg': {
          description: 'some object',
          type: 'object'
        },
        'booleanArg': {
          description: 'Some boolean value',
          type: 'java.lang.Boolean'
        }
        // TODO - add more types, above is what I remember from jolokia
      },
      description: 'Show some stuff in a form',
      type: 'java.lang.String',
      tabs: {
        'Tab One': ['key', 'value'],
        'Tab Two': ['*'],
        'Tab Three': ['booleanArg']
      }
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

    $scope.inputTableSchema = {
      properties: {
        'id': {
          description: 'Object ID',
          type: 'java.lang.String'
        }
      },
      description: 'Some objects'
    }

    $scope.inputTableData = [
      { id: "object1", name: 'foo' },
      { id: "object2", name: 'bar' }
    ];

    $scope.inputTableConfig = {
      data: 'inputTableData',
      displayFooter: false,
      showFilter: false,
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
  }

}
