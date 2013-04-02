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

    // the scope
    public scope:any = null;

    // the name to look up in the scope for the configuration data
    public scopeName: string = null;

    public properties = [];
    public action = '';

    public formclass = 'form-horizontal no-bottom-margin';
    public controlgroupclass = 'control-group';
    public controlclass = 'controls';
    public labelclass = 'control-label';

    public showtypes = 'false';

    public submiticon = 'icon-ok';
    public reseticon = 'icon-refresh';
    public cancelicon = 'icon-remove';

    public submittext = 'Submit';
    public resettext = 'Reset';
    public canceltext = 'Cancel';

    public oncancel = 'onCancel';
    public onsubmit = 'onSubmit';

    // TODO - add toggles to turn off cancel or reset buttons

    public getMode() {
      return this.mode || "edit";
    }

    public getEntity() {
      return this.entity || "entity";
    }

    public isReadOnly() {
      return this.getMode() === "view";
    }
  }

  export class SimpleForm {
    public restrict = 'A';
    public scope = true;
    public replace = true;
    public transclude = true;

    private attributeName = 'simpleForm';

    // see constructor for why this is here...
    public link: (scope, element, attrs) => any;

    constructor(private workspace, public $compile) {
      // necessary to ensure 'this' is this object <sigh>
      this.link = (scope, element, attrs) => {
        return this.doLink(scope, element, attrs);
      }
    }

    public isReadOnly() {
      return false;
    }

    private doLink(scope, element, attrs) {
      var config = new SimpleFormConfig;

      var configScopeName = attrs[this.attributeName] || attrs["schema"] || attrs["data"];
      config = configure(config, scope[configScopeName], attrs);
      config.scopeName = configScopeName;
      config.scope = scope;

      var entityName = config.getEntity();

      if (angular.isDefined(config.json)) {
        config.data = $.parseJSON(config.json);
      } else {
        config.data = scope[configScopeName] || scope[config.data];
      }

      var form = this.createForm(config);
      var fieldset = form.find('fieldset');

      var schema = config.data;
      angular.forEach(schema.properties, (arg, id) => {

        // TODO should also support getting inputs from the template cache, maybe
        // for type="template"

        var input = $('<div></div>');

        input.attr(Forms.normalize(arg.type, schema), '');
        angular.forEach(arg, function(value, key) {
          if (angular.isString(value) && key.indexOf("$") < 0) {
            var html = Core.escapeHtml(value);
            input.attr(key, html);
          }
        });
        input.attr('name', id);
        input.attr('entity', config.getEntity());
        input.attr('mode', config.getMode());

        if (configScopeName) {
          input.attr('data', configScopeName);
        }

        fieldset.append(input);
      });

      // TODO, I think these buttons could maybe be implemented differently as
      // a separate directive...
      var group = Forms.getControlGroup(config, {}, "");
      var controlDiv = Forms.getControlDiv(config);

      var cancel = null;
      var reset = null;
      var submit = null;
      if (!config.isReadOnly()) {
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
      var description = Core.pathGet(config, "data.description");
      if (description) {
        return '<legend>' + description + '</legend>';
      }
      return '';
    }
  }

}
