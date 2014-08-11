/// <reference path="formHelpers.ts"/>
/// <reference path="simpleFormDirective.ts"/>
/// <reference path="inputTableDirective.ts"/>
/// <reference path="baseDirectives.ts"/>
/// <reference path="submitDirective.ts"/>
/// <reference path="resetDirective.ts"/>
module Forms {

  export var pluginName = 'hawtio-forms';

  export var _module = angular.module(Forms.pluginName, ['bootstrap', 'ngResource', 'hawtioCore', 'datatable', 'ui.bootstrap', 'ui.bootstrap.dialog', 'hawtio-ui']);

  _module.config(["$routeProvider", ($routeProvider) => {
    $routeProvider.
      when('/forms/test', {templateUrl: 'app/forms/html/test.html'}).
      when('/forms/testTable', {templateUrl: 'app/forms/html/testTable.html'});
  }]);

  _module.directive('simpleForm', ["workspace", "$compile", (workspace, $compile) => {
    return new Forms.SimpleForm(workspace, $compile);
  }]);

  // an alias of the above so we can support older views still
  _module.directive('hawtioForm', ["workspace", "$compile", (workspace, $compile) => {
    return new Forms.SimpleForm(workspace, $compile);
  }]);

  _module.directive('hawtioInputTable', ["workspace", "$compile", (workspace, $compile) => {
    return new Forms.InputTable(workspace, $compile);
  }]);

  _module.directive('hawtioFormText', ["workspace", "$compile", (workspace, $compile) => {
    return new Forms.TextInput(workspace, $compile);
  }]);

  _module.directive('hawtioFormPassword', ["workspace", "$compile", (workspace, $compile) => {
    return new Forms.PasswordInput(workspace, $compile);
  }]);

  _module.directive('hawtioFormHidden', ["workspace", "$compile", (workspace, $compile) => {
    return new Forms.HiddenText(workspace, $compile);
  }]);

  _module.directive('hawtioFormNumber', ["workspace", "$compile", (workspace, $compile) => {
    return new Forms.NumberInput(workspace, $compile);
  }]);

  _module.directive('hawtioFormSelect', ["workspace", "$compile", (workspace, $compile) => {
    return new Forms.SelectInput(workspace, $compile);
  }]);

  _module.directive('hawtioFormArray', ["workspace", "$compile", (workspace, $compile) => {
    return new Forms.ArrayInput(workspace, $compile);
  }]);

  _module.directive('hawtioFormStringArray', ["workspace", "$compile", (workspace, $compile) => {
    return new Forms.StringArrayInput(workspace, $compile);
  }]);

  _module.directive('hawtioFormCheckbox', ["workspace", "$compile", (workspace, $compile) => {
    return new Forms.BooleanInput(workspace, $compile);
  }]);

  _module.directive('hawtioFormCustom', ["workspace", "$compile", (workspace, $compile) => {
    return new Forms.CustomInput(workspace, $compile);
  }]);

  _module.directive('hawtioSubmit', () => {
    return new Forms.SubmitForm();
  });

  _module.directive('hawtioReset', () => {
    return new Forms.ResetForm();
  });

  _module.run(["helpRegistry", (helpRegistry) => {
    helpRegistry.addDevDoc("forms", 'app/forms/doc/developer.md');
  }]);


  hawtioPluginLoader.addModule(pluginName);
}
