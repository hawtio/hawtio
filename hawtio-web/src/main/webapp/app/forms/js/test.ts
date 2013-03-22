module Forms {

  export function FormTestController($scope, workspace) {
    $scope.config = {
      url: "/some/url",
      method: "post",
      data: 'setVMOption'
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
          type: 'java.lang.String'
        },
        {
          desc: 'Long argument',
          name: 'longArg',
          type: 'Long'
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

  }

}
