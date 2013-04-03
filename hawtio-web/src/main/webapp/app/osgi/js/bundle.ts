module Osgi {

    export function BundleController($scope,$location, workspace:Workspace, $routeParams, jolokia) {
        $scope.bundleId = $routeParams.bundleId;

        updateTableContents();

        $scope.showValue = (key) => {
            switch (key) {
                case "Bundle-Name":
                case "Bundle-SymbolicName":
                case "Bundle-Version":
                case "Export-Package":
                case "Import-Package":
                    return false
                default:
                    return true;
            }
        }

        $scope.executeLoadClass = (clazz) => {
            var mbean = getHawtioOSGiMBean(workspace);
            if (mbean) {
                jolokia.request(
                    {type: 'exec', mbean: mbean, operation: 'getLoadClassOrigin', arguments: [$scope.bundleId, clazz]},
                    {
                        success: function(response) {
                            var divEl = document.getElementById("loadClassResult");
                            var resultBundle = response.value;
                            var style;
                            var resultTxt;
                            if (resultBundle === -1) {
                                style="";
                                resultTxt="Class can not be loaded from this bundle.";
                            } else {
                                style="alert-success";
                                resultTxt="Class is served from Bundle " + bundleLinks(workspace, resultBundle);
                            }
                            divEl.innerHTML +=
                                "<div class='alert " + style + "'>" +
                                    "<button type='button' class='close' data-dismiss='alert'>&times;</button>" +
                                    "Loading class <strong>" + clazz + "</strong> in Bundle " + $scope.bundleId + ". " + resultTxt;
                                "</div>";
                        },
                        error: function(response) {
                            inspectReportError(response);
                        }
                    });
            } else {
                inspectReportNoMBeanFound();
            }
        }

        $scope.executeFindResource = (resource) => {
            var mbean = getHawtioOSGiMBean(workspace);
            if (mbean) {
                jolokia.request(
                    {type: 'exec', mbean: mbean, operation: 'getResourceURL', arguments: [$scope.bundleId, resource]},
                    {
                        success: function(response) {
                            var divEl = document.getElementById("loadClassResult");
                            var resultURL = response.value;
                            var style;
                            var resultTxt;
                            if (resultURL === null) {
                                style="";
                                resultTxt="Resource can not be found from this bundle.";
                            } else {
                                style="alert-success";
                                resultTxt="Resource is available from: " + resultURL;
                            }
                            divEl.innerHTML +=
                                "<div class='alert " + style + "'>" +
                                    "<button type='button' class='close' data-dismiss='alert'>&times;</button>" +
                                    "Finding resource <strong>" + resource + "</strong> in Bundle " + $scope.bundleId + ". " + resultTxt;
                                "</div>";
                        },
                        error: function(response) {
                            inspectReportError(response);
                        }
                    }
                )
            } else {
                inspectReportNoMBeanFound();
            }
        }

        function inspectReportNoMBeanFound() {
            var divEl = document.getElementById("loadClassResult");
            divEl.innerHTML +=
                "<div class='alert alert-error'>" +
                    "<button type='button' class='close' data-dismiss='alert'>&times;</button>" +
                    "The io.hawt.osgi.OSGiTools MBean is not available. Please contact technical support." +
                "</div>";
        }

        function inspectReportError(response) {
            var divEl = document.getElementById("loadClassResult");
            divEl.innerHTML +=
                "<div class='alert alert-error'>" +
                    "<button type='button' class='close' data-dismiss='alert'>&times;</button>" +
                    "Problem invoking io.hawt.osgi.OSGiTools MBean. " + response +
                "</div>";
        }

        function populateTable(response) {
            var values = response.value;
            $scope.bundles = values;
            // now find the row based on the selection ui
            Osgi.defaultBundleValues(workspace, $scope, values);
            $scope.row = Osgi.findBundle($scope.bundleId, values);
            $scope.$apply();

            // This trick is to ensure that the popover is properly visible if it is
            // smaller than the accordion
            $('.accordion-body.collapse').hover(
                function () {
                    $(this).css('overflow','visible');
                },
                function () {
                    $(this).css('overflow','hidden');
                }
            );

            // setup tooltips
            $("#bsn").tooltip({title: readHeaderData($scope.row.Headers["Bundle-SymbolicName"].Value),
                placement: "right"});

            // setup export popovers
            for (var pkg in $scope.row.ExportData) {
                var po = "<small><table>" +
                        "<tr><td><strong class='text-info'>Version=</strong>" + $scope.row.ExportData[pkg].ReportedVersion + "</td></tr>";
                for (var da in $scope.row.ExportData[pkg]) {
                    var type = da.charAt(0);

                    var separator = "";
                    var txtClass;
                    if (type === "A") {
                        separator = "=";
                        txtClass = "text-info";
                    }
                    if (type === "D") {
                        separator = ":=";
                        txtClass = "muted";
                    }

                    if (separator !== "") {
                        if (da === "Aversion") {
                            // We're using the 'ReportedVersion' as it comes from PackageAdmin
                            continue;
                        }

                        var value = $scope.row.ExportData[pkg][da];
                        value = value.replace(/[,]/g, ",<br/>&nbsp;&nbsp;");
                        po += "<tr><td><strong class='" + txtClass + "'>" + da.substring(1) + "</strong>" + separator + value + "</td></tr>";
                    }
                }
                po += "</table></small>";
                $(document.getElementById("export." + pkg)).
                    popover({title: "attributes and directives", content: po, trigger: "hover", html: true });
            }
        };

        function readHeaderData(header: string) : string {
            var idx = header.indexOf(";");
            if (idx <= 0)
                return "";

            return header.substring(idx + 1).trim();
        }

        function updateTableContents() {
            //console.log("Loading the bundles");
            var mbean = getSelectionBundleMBean(workspace);
            if (mbean) {
                jolokia.request(
                        {type: 'exec', mbean: mbean, operation: 'listBundles()'},
                        onSuccess(populateTable));
            }
        }

        $scope.startBundle = (bundleId) => {
            jolokia.request([
                {type: 'exec', mbean: getSelectionFrameworkMBean(workspace), operation: 'startBundle', arguments: [bundleId]}
            ],
                    onSuccess(updateTableContents));
        };

        $scope.stopBundle = (bundleId) => {
            jolokia.request([
                {type: 'exec', mbean: getSelectionFrameworkMBean(workspace), operation: 'stopBundle', arguments: [bundleId]}
            ],
                    onSuccess(updateTableContents));
        };

        $scope.updatehBundle = (bundleId) =>{
            jolokia.request([
                {type: 'exec', mbean: getSelectionFrameworkMBean(workspace), operation: 'updateBundle', arguments: [bundleId]}
            ],
                    onSuccess(updateTableContents));
        };

        $scope.refreshBundle = (bundleId) => {
            jolokia.request([
                {type: 'exec', mbean: getSelectionFrameworkMBean(workspace), operation: 'refreshBundle', arguments: [bundleId]}
            ],
                    onSuccess(updateTableContents));
        };

        $scope.uninstallBundle = (bundleId) => {
            jolokia.request([
                {type: 'exec', mbean: getSelectionFrameworkMBean(workspace), operation: 'uninstallBundle', arguments: [bundleId]}
            ],
                    onSuccess($location.path("/osgi/bundle-list")));
        };
    }
}
