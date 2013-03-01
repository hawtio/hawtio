module JBoss {
    export function JBossController($scope, $location:ng.ILocationService, jolokia) {

        $scope.webapps = [];
        $scope.selected = [];
        $scope.search = "";

        var columnDefs: any[] = [
            {
                field: 'name',
                displayName: 'Name',
                cellFilter: null,
                width: "*",
                resizable: true
            },
            {
                field: 'contextPath',
                displayName: 'Context-Path',
                cellFilter: null,
                width: "*",
                resizable: true
            },
            {
                field: 'state',
                displayName: 'State',
                cellFilter: null,
                width: "*",
                resizable: false
            }
        ];

        $scope.gridOptions = {
            data: 'webapps',
            displayFooter: false,
            selectedItems: $scope.selected,
            selectWithCheckboxOnly: true,
            columnDefs: columnDefs,
            filterOptions: {
                filterText: 'search'
            }
        };

        function render(response) {
            $scope.webapps = [];
            $scope.selected.length = 0;

            // create structure for each response
            angular.forEach(response, function(value, key) {
                var obj = {
                    mbeanName: value,
                    name: cleanWebAppName(jolokia.getAttribute(value, "name")),
                    // we do not have a jmx attribute for the context-path
                    contextPath: cleanContextPath(jolokia.getAttribute(value, "name")),
                    state: jolokia.getAttribute(value, "status")
                };
                $scope.webapps.push(obj);
            });
            $scope.$apply();
        };

        // function to trigger reloading page
        $scope.onResponse = function () {
            jolokia.search("jboss.as:deployment=*",
                {
                    success: render,
                    error: render
                });
        }

        // function to control the web applications
        $scope.controlWebApps = function(op) {
            // grab id of mbean names to control
            var ids = $scope.selected.map(function(b) { return b.mbeanName });
            if (!angular.isArray(ids)) {
                ids = [ids];
            }

            // execute operation on each mbean
            ids.forEach((id) => {
                jolokia.request({
                        type: 'exec',
                        mbean: id,
                        operation: op,
                        arguments: null
                    },
                    {
                        success: $scope.onResponse,
                        error: $scope.onResponse
                    });
            });
        }

        $scope.start = function() {
            $scope.controlWebApps('deploy');
        }

        $scope.stop = function() {
            $scope.controlWebApps('undeploy');
        }

        $scope.reload = function() {
            $scope.controlWebApps('redeploy');
        }

        $scope.uninstall = function() {
            $scope.controlWebApps('remove');
        }

        // register to core to poll a search for the web apps so the page is dynamic updated
        Core.registerSearch(jolokia, $scope, "jboss.as:deployment=*", onSuccess(render));

        // grab server information once
        $scope.jbossServerVersion = "";
        $scope.jbossServerName = "";
        $scope.jbossServerLaunchType = "";

        var servers = jolokia.search("jboss.as:management-root=server")
        if (servers && servers.length === 1) {
            $scope.jbossServerVersion = jolokia.getAttribute(servers[0], "releaseVersion")
            $scope.jbossServerName = jolokia.getAttribute(servers[0], "name")
            $scope.jbossServerLaunchType = jolokia.getAttribute(servers[0], "launchType")
        } else {
            console.log("Cannot find jboss server or there was more than one server. response is: " + servers)
        }

        function cleanWebAppName(name: string) {
            // JBoss may include .war as the application name, so remove that
            if (name.lastIndexOf(".war") > -1) {
                return name.replace(".war", "")
            } else {
                return name
            }
        }

        function cleanContextPath(contextPath: string) {
            return "/" + cleanWebAppName(contextPath)
        }

    }
}