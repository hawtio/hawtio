module Forms {

  export class SimpleForm {

    public restrict = 'A';

    constructor(private workspace) {

    }

    public link(scope, element, attrs) {

      var config = scope[attrs['simpleForm']];

      var method = 'post';
      var data = {};
      var url = '';


      console.log("attrs: ", attrs);
      console.log("config: ", config);
    }

  }

}
