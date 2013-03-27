module Forms {

  export function FormTestController($scope, workspace) {

    $scope.editing = false;

    $scope.toggleEdit = function() {
      $scope.editing = !$scope.editing;
    };

    $scope.setVMOption = {
      properties: {
        'key': {
          description: 'Argument key',
          type: 'java.lang.String'
        },
        'value': {
          description: 'Argument Value',
          type: 'java.lang.String',
          def: 'foobar'
        },
        'longArg': {
          description: 'Long argument',
          type: 'Long',
          def: '5'
        },
        'intArg': {
          description: 'Int argument',
          type: 'Integer'
        }
        // TODO - add more types, above is what I remember from jolokia
      },
      description: 'Show some stuff in a form',
      type: 'java.lang.String'
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

  }

}
