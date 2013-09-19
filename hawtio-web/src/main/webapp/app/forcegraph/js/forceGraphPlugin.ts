module ForceGraph {
    var pluginName = 'forceGraph';

    angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).

        directive('hawtioForceGraph', function () {

            return {
                restrict: 'E',
                template: '<div>Hi, <span ng-transclude></span> !</div>',
                replace: true,
                transclude: true
            };

        });

    hawtioPluginLoader.addModule(pluginName);
}