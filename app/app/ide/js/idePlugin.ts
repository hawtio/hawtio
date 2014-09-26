/**
 * IDE integration
 *
 * @module IDE
 */
/// <reference path="ideHelpers.ts"/>
/// <reference path="../../core/js/corePlugin.ts"/>
module IDE {
    var pluginName = 'ide';

    export var _module = angular.module(pluginName, ['bootstrap', 'hawtioCore']);

    _module.directive('hawtioOpenIde', ["localStorage", "workspace", "jolokia", (localStorage, workspace, jolokia) => {
        return new IDE.OpenInIdeDirective(localStorage, workspace, jolokia);
    }]);

    _module.run(["helpRegistry", (helpRegistry) => {
      helpRegistry.addDevDoc('IDE', 'app/ide/doc/developer.md');
    }]);

    hawtioPluginLoader.addModule(pluginName);
}
