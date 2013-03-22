module Forms {

  export class SimpleForm {

    public restrict = 'A';
    public replace = true;
    public transclude = true;

    // see constructor for why this is here...
    public link: (scope, element, attrs) => any;

    private method = 'post';
    private data:any = {};
    private json:any = undefined;
    private args = [];
    private url = '';

    constructor(private workspace) {

      // necessary to ensure 'this' is this object <sigh>
      this.link = (scope, element, attrs) => {
        return this.doLink(scope, element, attrs);
      }

    }

    private sanitize(args) {
      if (args) {
        args.forEach( function (arg) {
          if (angular.isDefined(arg.formType)) {
            // user-defined input type
            return;
          }
          switch (arg.type) {
            case "int":
            case "long":
              arg.formType = "number";
              break;
            default:
              arg.formType = "text";
          }
        });
      }

      return args;
    };

    private doLink(scope, element, attrs) {
      var config = scope[attrs['simpleForm']];

      this.configure(config, attrs);

      //console.log("attrs: ", attrs);
      //console.log("config: ", config);
      //console.log("This: ", this);

      if (angular.isDefined(this.json)) {
        this.data = $.parseJSON(this.json);
      } else {
        this.data = scope[this.data];
      }
      //console.log("data: ", this.data);
      this.args = this.sanitize(this.data.args);

      console.log("args:", this.args);

      var form = this.createForm();

      var addInput = function(arg) {
        var input = this.getInput(arg);
        form.append(input);
      }

      this.args.forEach(addInput, this);

      $(element).append(form);
    }

    private createForm() {
      return $('<form class="form-horizontal no-bottom-margin"><fieldset><legend>' + this.data.desc + '</legend><div class="control-group"></div></fieldset></form>');
    }

    // TODO: support more input types, i.e. checkboxes/radio/select
    private getInput(arg) {
      return $('<div class="control-group" title="' + arg.desc + '"><label class="control-label">' + arg.name.capitalize() + ': </label><div class="controls"><input type="' + arg.formType + '"><span class="help-block">type: ' + arg.type + '</span></div></div>');
    }

    private configure(config, attrs) {
      if (angular.isDefined(config)) {
        angular.extend(this, config);
      }
      angular.extend(this, attrs);
    }

  }

}
