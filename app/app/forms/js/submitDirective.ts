module Forms {

  export class SubmitForm {
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

      var target = 'form[name=' + attrs['hawtioSubmit'] + ']';

      el.click(function() {
        $(target).submit();
        return false;
      });

    }
  }
}
