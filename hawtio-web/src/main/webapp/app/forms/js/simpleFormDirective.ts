module Forms {

  export class SimpleFormConfig {

    public name = 'form';
    public method = 'post';

    // the name of the attribute in the scope which is the data to be editted
    public entity = 'entity';

    // set to 'view' or 'create' for different modes
    public mode = 'edit';

    // the definition of the form
    public data:any = {};
    public json:any = undefined;

    public args = [];
    public action = '';

    public formclass = 'form-horizontal no-bottom-margin';
    public controlgroupclass = 'control-group';
    public controlclass = 'controls';
    public labelclass = 'control-label';

    public showtypes = 'true';

    public submiticon = 'icon-ok';
    public reseticon = 'icon-refresh';
    public cancelicon = 'icon-remove';

    public submittext = 'Submit';
    public resettext = 'Reset';
    public canceltext = 'Cancel';

    public oncancel = 'onCancel';
    public onsubmit = 'onSubmit';

    // TODO - add toggles to turn off cancel or reset buttons

    // TODO - do actual two-way databinding
  }

  export class SimpleForm {

    public restrict = 'A';
    public scope = true;
    public replace = true;
    public transclude = true;

    // see constructor for why this is here...
    public link: (scope, element, attrs) => any;


    constructor(private workspace, public $compile) {

      // necessary to ensure 'this' is this object <sigh>
      this.link = (scope, element, attrs) => {
        return this.doLink(scope, element, attrs);
      }

    }

    private sanitize(arg) {
      if (angular.isDefined(arg.formType)) {
        // user-defined input type
        return arg;
      }
      switch (arg.type.toLowerCase()) {
        case "int":
        case "integer":
        case "long":
        case "short":
        case "java.lang.integer":
        case "java.lang.long":
          arg.formType = "number";
          break;
        default:
          arg.formType = "text";
      }

      return arg;
    }

    private doLink(scope, element, attrs) {
      var config = new SimpleFormConfig;

      config = this.configure(config, scope[attrs['simpleForm']], attrs);

      var mode = config.mode || 'edit';
      var entityName = config.entity || "entity";
      if (!scope[entityName]) {
        // start with an empty entity if its not defined
        scope[entityName] = {};
      }

      if (angular.isDefined(config.json)) {
        config.data = $.parseJSON(config.json);
      } else {
        config.data = scope[config.data];
      }

      var form = this.createForm(config);
      var fieldset = form.find('fieldset');

      var addInput = function(arg) {
        var input = this.assembleInput(config, arg);
        fieldset.append(input);
      };

      config.data.args.forEach(addInput, this);

      var group = this.getControlGroup(config, {});
      var controlDiv = this.getControlDiv(config);


      var cancel = null;
      var reset = null;
      var submit = null;
      if (mode !== 'view') {
        cancel = this.getCancelButton(config);
        reset = this.getResetButton(config);
        submit = this.getSubmitButton(config);
      }

      var findFunction = function(scope, func) {
        if (angular.isDefined(scope[func]) && angular.isFunction(scope[func])) {
          return scope;
        }
        if (angular.isDefined(scope.$parent) && scope.$parent !== null) {
          return findFunction(scope.$parent, func);
        } else {
          return null;
        }
      };

      function maybeGet(scope, func) {
        if (scope !== null) {
          return scope[func];
        }
        return null;
      }

      var onSubmitFunc = config.onsubmit.replace('(', '').replace(')', '');
      var onCancelFunc = config.oncancel.replace('(', '').replace(')', '');

      var onSubmit = maybeGet(findFunction(scope, onSubmitFunc), onSubmitFunc);
      var onCancel = maybeGet(findFunction(scope, onCancelFunc), onCancelFunc);

      if (onSubmit === null) {
        onSubmit = function (json, form) {
          notification('error', 'No submit handler defined for form ' + form.get(0).name);
        }
      }

      if (onCancel === null) {
        onCancel = function(form) {
          notification('error', 'No cancel handler defined for form ' + form.get(0).name);
        }
      }

      if (angular.isDefined(onSubmit)) {
        form.submit(() => {
          var entity = scope[entityName];
          onSubmit(entity, form);
          return false;
        });
      }

      controlDiv.addClass('btn-group');
      if (cancel) {
        if (angular.isDefined(onCancel)) {
          cancel.click((event) => {
            onCancel(form);
            return false;
          });
        }

        controlDiv.append(cancel);
      }
      if (reset) {
        reset.click((event) => {
          form.get(0).reset();
          return false;
        });
        controlDiv.append(reset);
      }
      if (submit) {
        submit.click((event) => {
          form.submit();
          return false;
        });
        controlDiv.append(submit);
      }

      group.append(controlDiv);
      fieldset.append(group);

      $(element).append(form);

      // compile the template
      this.$compile(form)(scope);
    }


    private getCancelButton(config) {
      return $('<button type="button" class="btn cancel"><i class="' + config.cancelicon + '"></i> ' + config.canceltext + '</button>');
    }

    private getResetButton(config) {
      return $('<button type="button" class="btn reset"><i class="' + config.reseticon + '"></i> ' + config.resettext + '</button>');
    }

    private getSubmitButton(config) {
      return $('<button type="submit" class="btn btn-success submit"><i class="' + config.submiticon + '"></i> ' + config.submittext + '</button>');
    }


    private createForm(config) {
      var form = $('<form class="' + config.formclass + '"><fieldset></fieldset></form>');
      form.attr('name', config.name);
      form.attr('action', config.action);
      form.attr('method', config.method);
      form.find('fieldset').append(this.getLegend(config));
      return form;
    }


    private getLegend(config) {
      if (angular.isDefined(config.data.desc)) {
        return '<legend>' + config.data.desc + '</legend>';
      }
      return '';
    }


    private getControlGroup(config, arg) {
      var rc = $('<div class="' + config.controlgroupclass + '"></div>');
      if (angular.isDefined(arg.desc)) {
        rc.attr('title', arg.desc);
      }
      return rc;
    }


    private getLabel(config, arg) {
      return $('<label class="' + config.labelclass + '">' + humanizeValue(arg.name.capitalize()) + ': </label>');
    }


    private getControlDiv(config) {
      return $('<div class="' + config.controlclass + '"></div>');
    }


    private getHelpSpan(config, arg) {
      var rc = $('<span class="help-block"></span>');
      if (angular.isDefined(arg.type) && config.showtypes !== 'false') {
        rc.append('Type: ' + arg.type);
      }
      return rc;
    }


    // TODO: support more input types, i.e. checkboxes/radio/select which vary from regular inputs
    private assembleInput(config, arg) {
      var group = this.getControlGroup(config, arg);
      group.append(this.getLabel(config, arg));
      var controlDiv = this.getControlDiv(config);
      controlDiv.append(this.getInput(config, arg));
      controlDiv.append(this.getHelpSpan(config, arg));
      group.append(controlDiv);
      return group;
    }


    private getInput(config, arg) {
      var a = this.sanitize(arg);

      switch (a.formType) {
        default:
          var rc = $('<input type="' + a.formType + '">');
          rc.attr('name', a.name);
          if (angular.isDefined(a.def)) {
            rc.attr('value', a.def);
          }
          var modelName = a.model;
          if (!angular.isDefined(a.model)) {
            // TODO always use 2 way binding?
            modelName = (config.entity || "entity") + "." + a.name;
          }
          if (modelName) {
            rc.attr('ng-model', modelName);
          }
          return rc;
      }
    }

    private configure(config, scopeConfig, attrs) {
      if (angular.isDefined(scopeConfig)) {
        config = angular.extend(config, scopeConfig);
      }
      return angular.extend(config, attrs);
    }

  }

}
