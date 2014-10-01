/**
 * @module Insight
 * @main Insight
 */
/// <reference path="insightHelpers.ts"/>
module Insight {

    export var pluginName = 'insight';

    // create our angular module and tell angular what route(s) it will handle
    export var _module = angular.module(pluginName, ['hawtioCore']);

    _module.config(["$routeProvider", ($routeProvider:ng.route.IRouteProvider) => {
        $routeProvider.
            when('/insight/all', { templateUrl: 'app/insight/html/all.html' }).
            when('/insight/jvms', { templateUrl: 'app/insight/html/jvms.html' }).
            when('/insight/elasticsearch', { templateUrl: 'app/insight/html/elasticsearch.html' }).
            when('/insight/logs', { redirectTo: function() { return '/insight/dashboard?kbnId=app/insight/dashboards/logs&p=insight';} }).
            when('/insight/camel', { redirectTo: function() { return '/insight/dashboard?kbnId=app/insight/dashboards/camel&p=insight';} }).
            when('/insight/dashboard', { templateUrl: '../hawtio-kibana/app/partials/dashboard.html' });
    }]);

    _module.run(["workspace", "viewRegistry", "helpRegistry", "serviceIconRegistry", (workspace, viewRegistry, helpRegistry, serviceIconRegistry) => {

        serviceIconRegistry.addIcons({
            title: "Fabric8 Insight",
            type: "icon",
            src: "icon-eye-open"
        }, "org.fusesource.insight", "io.fabric8.insight");

        Perspective.metadata['insight'] = {
            icon: {
                title: "Fabric8 Insight",
                type: "icon",
                src: "icon-eye-open"
            },
            label: "Insight",
            isValid: (workspace) => Insight.hasInsight(workspace),
            topLevelTabs: {
                includes: [
                    {
                        href: "#/insight"
                    },
                    {
                        href: "#/camin"
                    },
                    {
                        id: "insight-logs"
                    },
                    {
                        id: "insight-camel"
                    }
                ]
            }
        };

        viewRegistry["insight"] = "../hawtio-kibana/app/partials/hawtioLayout.html";

        helpRegistry.addUserDoc('insight', 'app/insight/doc/help.md', () => {
            return Fabric.hasFabric(workspace) && Insight.hasInsight(workspace);
        });

        // instead lets add the Metrics link on the Fabric sub nav bar

        // Set up top-level link to our plugin
        workspace.topLevelTabs.push({
            id: "insight-metrics",
            content: "Metrics",
            title: "View Insight metrics",
            href: () => "#/insight/all",
            isValid: (workspace:Workspace) => {
                return Fabric.hasFabric(workspace) && Insight.hasInsight(workspace);
            }
        });

        // Set up top-level link to our plugin
        workspace.topLevelTabs.push({
            id: "insight-logs",
            content: "Logs",
            title: "View Insight Logs",
            href: () => "#/insight/logs",
            isValid: (workspace:Workspace) => {
                return Fabric.hasFabric(workspace) && Insight.hasInsight(workspace);
            }
        });

        // Set up top-level link to our plugin
        workspace.topLevelTabs.push({
            id: "insight-camel",
            content: "Camel",
            title: "View Insight Camel",
            href: () => "#/insight/camel",
            isValid: (workspace:Workspace) => {
                return Fabric.hasFabric(workspace) && Insight.hasInsight(workspace);
            }
        });

    }]);

    // tell the hawtio plugin loader about our plugin so it can be
    // bootstrapped with the rest of angular
    hawtioPluginLoader.addModule(pluginName);

}

