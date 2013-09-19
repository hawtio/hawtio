module ForceGraph {
    var pluginName = 'forceGraph';

    angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).

        directive('hawtioForceGraph', function () {
            return new ForceGraph.ForceGraphDirective();
        });

    hawtioPluginLoader.addModule(pluginName);
}