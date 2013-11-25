/**
 * Force Graph plugin & directive
 *
 * @module ForceGraph
 */
module ForceGraph {
    var pluginName = 'forceGraph';

    angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).

        directive('hawtioForceGraph', function () {
            return new ForceGraph.ForceGraphDirective();
        })
        .run((helpRegistry) => {
          helpRegistry.addDevDoc('Force Graph', 'app/forcegraph/doc/developer.md');
        });

    hawtioPluginLoader.addModule(pluginName);
}
