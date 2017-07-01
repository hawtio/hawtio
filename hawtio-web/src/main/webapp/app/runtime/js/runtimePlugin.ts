/**
 * @module Runtime
 * 
 * 
 */
/// <reference path="./runtimeExports.ts"/>
module Runtime {
    

    _module.config(
        ['$routeProvider', ( $routeProvider: ng.route.IRouteProvider ) => {

            $routeProvider
                .when( '/runtime/overview', { templateUrl: templatePath + 'overview.html'})
                .when('/runtime/systemProperties', { templateUrl: templatePath + 'systemProperties.html'})
                .when('/runtime/metrics', { templateUrl: templatePath + 'metrics.html'});
            
        }] );


    _module.run(( workspace: Workspace, viewRegistry, helpRegistry, layoutFull ) => {

        viewRegistry[pluginName] = templatePath + "layoutRuntime.html";
        helpRegistry.addUserDoc('runtime', 'app/runtime/doc/help.md');

        workspace.topLevelTabs.push( {
            id: "runtime",
            content: "Runtime",
            title: "Java Runtime Process Information",
            isValid: ( workspace: Workspace ) => {
                return true;
            },
            href: () => {
                return "#/" + pluginName + "/overview";
            },
            isActive: ( workspace: Workspace ) => {
                return workspace.isLinkActive( pluginName );
            }
        });

    });

    hawtioPluginLoader.addModule( pluginName );
};

