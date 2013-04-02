module Forms {

  export class ResetForm {
    public restrict = 'A';
    public scope = true;

    public link: (scope, element, attrs) => any;

    constructor() {
      // necessary to ensure 'this' is this object <sigh>
      this.link = (scope, element, attrs) => {
        return this.doLink(scope, element, attrs);
      }
    }

    private doLink(scope, element, attrs) {

      var el = $(element);

      var target = 'form[name=' + attrs['hawtioReset'] + ']';

      el.click(function() {
        var forms:any = $(target);
        for (var i=0; i < forms.length; i++) {
          forms[i].reset();
        }
        return false;
      });

    }
  }
}
