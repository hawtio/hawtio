/**
 * Force Graph plugin & directive
 *
 * @module ForceGraph
 */
module ForceGraph {
    var pluginName = 'forceGraph';

    angular.module(pluginName, ['bootstrap', 'ngResource']).

        directive('hawtioForceGraph', function () {
            return new ForceGraph.ForceGraphDirective();
        });

    hawtioPluginLoader.addModule(pluginName);
}
