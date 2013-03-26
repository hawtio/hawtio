module Forms {

  export class SimpleReadOnlyForm extends SimpleForm {

    private attributeName = 'simpleReadOnlyForm';

    constructor(private workspace, public $compile) {
      super(workspace, $compile);
    }

    private getCancelButton(config) {
      return '';
    }

    private getResetButton(config) {
      return '';
    }

    private getSubmitButton(config) {
      return '';
    }

    private getInput(config, arg) {
      var a = this.sanitize(arg);

      switch (a.formType) {
        default:
          var rc = $('<span class="form-data"></span>');
          var modelName = a.model;
          if (!angular.isDefined(a.model)) {
            // TODO always use 2 way binding?
            modelName = config.getEntity() + "." + a.name;
          }
          if (modelName) {
            rc.attr('ng-model', modelName);
            rc.append('{{' + modelName + '}}')
          }

          return rc;
      }
    }


  }

}
