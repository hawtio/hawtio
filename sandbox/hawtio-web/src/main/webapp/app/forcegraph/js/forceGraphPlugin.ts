/**
 * Force Graph plugin & directive
 *
 * @module ForceGraph
 */
module ForceGraph {
    var pluginName = 'forceGraph';

    export var _module = angular.module(pluginName, ['bootstrap', 'ngResource']);

    _module.directive('hawtioForceGraph', function () {
        return new ForceGraph.ForceGraphDirective();
    });

    hawtioPluginLoader.addModule(pluginName);
}
