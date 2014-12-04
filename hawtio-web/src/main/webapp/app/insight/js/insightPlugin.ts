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
            when('/insight/elasticsearch', { templateUrl: 'app/insight/html/eshead.html' }).
            when('/insight/logs', { redirectTo: function() { return '/insight/dashboard?kbnId=app/insight/dashboards/logs&p=insight&tab=insight-logs';} }).
            when('/insight/camel', { redirectTo: function() { return '/insight/dashboard?kbnId=app/insight/dashboards/camel&p=insight&tab=insight-camel';} }).
            when('/insight/dashboard', { templateUrl: '../hawtio-kibana/app/partials/dashboard.html' });
    }]);

    _module.run(["workspace", "viewRegistry", "helpRegistry", "serviceIconRegistry", "layoutFull", (workspace, viewRegistry, helpRegistry, serviceIconRegistry, layoutFull) => {

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
                        href: "#/camin"
                    },
                    {
                        id: "insight-logs"
                    },
                    {
                        id: "insight-camel"
                    },
                    {
                        id: "insight-eshead"
                    }
                ]
            }
        };

        viewRegistry["insight"] = "../hawtio-kibana/app/partials/hawtioLayout.html";
        viewRegistry["eshead"] = layoutFull;

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
                return Fabric.hasFabric(workspace) && Insight.hasInsight(workspace) && Insight.hasKibana(workspace);
            },
            isActive: () => workspace.isTopTabActive("insight-logs")
        });

        // Set up top-level link to our plugin
        workspace.topLevelTabs.push({
            id: "insight-camel",
            content: "Camel Events",
            title: "View Insight Camel",
            href: () => "#/insight/camel",
            isValid: (workspace:Workspace) => {
                return Fabric.hasFabric(workspace) && Insight.hasInsight(workspace) && Insight.hasKibana(workspace);
            },
            isActive: () => workspace.isTopTabActive("insight-camel")
        });

        // Set up top-level link to our plugin
        workspace.topLevelTabs.push({
            id: "insight-eshead",
            content: "Elasticsearch",
            title: "View Insight Elasticsearch",
            href: () => "#/insight/elasticsearch?tab=eshead",
            isValid: (workspace:Workspace) => {
                return Fabric.hasFabric(workspace) && Insight.hasInsight(workspace) && Insight.hasEsHead(workspace);
            },
            isActive: () => workspace.isTopTabActive("insight-eshead")
        });

    }]);

    // tell the hawtio plugin loader about our plugin so it can be
    // bootstrapped with the rest of angular
    hawtioPluginLoader.addModule(pluginName);

}

