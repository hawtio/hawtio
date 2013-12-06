/**
 * Force Graph plugin & directive
 *
 * @module IDE
 */
module IDE {
    var pluginName = 'ide';

    angular.module(pluginName, ['bootstrap', 'hawtioCore']).

        directive('hawtioOpenIde', function (localStorage, workspace, jolokia) {
            return new IDE.OpenInIdeDirective(localStorage, workspace, jolokia);
        })
        .run((helpRegistry) => {
          helpRegistry.addDevDoc('IDE', 'app/ide/doc/developer.md');
        });

    hawtioPluginLoader.addModule(pluginName);
}
