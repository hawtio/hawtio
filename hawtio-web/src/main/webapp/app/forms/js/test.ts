module Forms {

  export function FormTestController($scope, workspace) {

    $scope.editing = false;

    $scope.toggleEdit = function() {
      $scope.editing = !$scope.editing;
    }

    $scope.setVMOption = {
      args: [
        {
          desc: 'Argument key',
          name: 'key',
          type: 'java.lang.String'
        },
        {
          desc: 'Argument Value',
          name: 'value',
          type: 'java.lang.String',
          def: 'foobar'
        },
        {
          desc: 'Long argument',
          name: 'longArg',
          type: 'Long',
          def: '5'
        },
        {
          desc: 'Int argument',
          name: 'intArg',
          type: 'Integer'
        }
        // TODO - add more types, above is what I remember from jolokia
      ],
      desc: 'Show some stuff in a form',
      ret: 'java.lang.String'
    }

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
