module Forms {

  export function SimpleForm(workspace) => {
    var directiveDefinition = {
      restrict: 'A',
      link: (scope, element, attrs) => {

        var config = scope[attrs['simpleForm']];

        var method = 'post';
        var data = {};
        var url = '';


        console.log("attrs: ", attrs);
        console.log("config: ", config);
      }
    };

    return directiveDefinition;
  };
}
