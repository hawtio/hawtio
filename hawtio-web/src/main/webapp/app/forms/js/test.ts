module Forms {

  export function FormTestController($scope, workspace) {
    $scope.config = {
      name: 'form-with-config-object',
      action: "/some/url",
      method: "post",
      data: 'setVMOption',
      showtypes: 'false'
    };

    $scope.onCancel = (form) => {
      notification('success', 'Cancel clicked on form "' + form.get(0).name + '"');
    };

    $scope.onSubmit = (form) => {
      notification('success', 'Form "' + form.get(0).name + '" submitted... (well not really)');
    };

    $scope.derp = (json, form) => {
      notification('error', 'derp with json ' + JSON.stringify(json));
    };

    $scope.setVMOption = {
      args: [
        {
          desc: 'Argument key',
          name: 'key',
          model: 'entity.key',
          type: 'java.lang.String'
        },
        {
          desc: 'Argument Value',
          name: 'value',
          model: 'entity.value',
          type: 'java.lang.String',
          def: 'foobar'
        },
        {
          desc: 'Long argument',
          name: 'longArg',
          model: 'entity.longArg',
          type: 'Long',
          def: '5'
        },
        {
          desc: 'Int argument',
          name: 'intArg',
          model: 'entity.intArg',
          type: 'Integer'
        }
          // TODO - add more types, above is what I remember from jolokia
        ],
      desc: 'Show some stuff in a form',
      ret: 'java.lang.String'
    }

  }

}
