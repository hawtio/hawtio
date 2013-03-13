module Osgi {
    export function BundleListController($scope, workspace:Workspace, jolokia) {
        $scope.result = {};
        $scope.bundles = [];
        $scope.bundleUrl = "";
        $scope.display = {
            bundleField: "Name",
            sortField: "Identifier",
            bundleFilter: "",
            startLevelFilter: undefined
        };

        $scope.installDisabled = function() {
            return $scope.bundleUrl === "";
        }

        $scope.install = function() {
            jolokia.request({
                type: 'exec',
                mbean: getSelectionFrameworkMBean(workspace),
                operation: "installBundle(java.lang.String)",
                arguments: [$scope.bundleUrl]
            },{
                success: function(response) {
                    var bundleID = response.value;
                    jolokia.request({
                            type: 'exec',
                            mbean: getSelectionBundleMBean(workspace),
                            operation: "isFragment(long)",
                            arguments: [bundleID]
                    },{
                        success: function(response) {
                            var isFragment = response.value;
                            if (isFragment) {
                                notification("success", "Fragment installed succesfully.");
                                $scope.bundleUrl = "";
                                $scope.$apply();
                            } else {
                                jolokia.request({
                                    type: 'exec',
                                    mbean: getSelectionFrameworkMBean(workspace),
                                    operation: "startBundle(long)",
                                    arguments: [bundleID]
                                },{
                                    success: function(response) {
                                        notification("success", "Bundle installed and started successfully.");
                                        $scope.bundleUrl = "";
                                        $scope.$apply();
                                    },
                                    error: function(response) { notification("error", response.error)}
                                });
                            }
                        },
                        error: function(response) { notification("error", response.error)}
                    });
                },
                error: function(response) {
                    notification("error", response.error);
                }
            });
        }

        $scope.$watch("display.sortField", function() {
            $scope.bundles = $scope.bundles.sortBy(function(n){
                switch ($scope.display.sortField) {
                    case "Name":
                        return n.Name;
                    case "SymbolicName":
                        return n.SymbolicName;
                    default:
                        return n.Identifier;
                }
            });
            render();
        });
        $scope.$watch("display.bundleField", function() {
            render();
        });
        $scope.$watch("display.bundleFilter", function() {
            render();
        });
        $scope.$watch("display.startLevelFilter", function() {
            render();
        });

        function addRow(bundleObject, labelText) {
            var labelClass = "badge " + Osgi.getStateStyle("badge", bundleObject.State);
            var table = <HTMLTableElement>document.getElementById("bundleTable");
            var numRows = table.rows.length;
            var curRow = <HTMLTableRowElement>table.rows[numRows-1];
            var numCols = typeof curRow === 'undefined' ? 999 : curRow.cells.length;
            var newCell;
            if (numCols < 3) {
                newCell = <HTMLTableCellElement>curRow.insertCell(numCols);
            } else {
                var newRow = <HTMLTableRowElement>table.insertRow(numRows);
                newCell = <HTMLTableCellElement>newRow.insertCell(0);
            }

            var placement = (numCols === 2) ? 'left' : 'right';

            newCell.innerHTML =
                "<a href='#/osgi/bundle/" + bundleObject.Identifier +"' id=" + bundleObject.Identifier + " rel='popover'><span class='" + labelClass + "'>" + labelText + "</span></a>";
            var po =
                "<small><table>" +
                "<tr><td><strong class='muted'>ID</strong> " + bundleObject.Identifier +
                    (bundleObject.Fragment === true ? " (fragment) " : "") + "</td></tr>" +
                "<tr><td><strong class='muted'>Name</strong> " + bundleObject.Name + "</td></tr>" +
                "<tr><td><strong class='muted'>Version</strong> " + bundleObject.Version + "</td></tr>" +
                "<tr><td><strong class='muted'>State</strong> <div class='label "
                    + Osgi.getStateStyle("label", bundleObject.State)
                    + "'>" + bundleObject.State + "</div></td></tr>" +
                "<tr><td><strong class='muted'>Start Level</strong> " + bundleObject.StartLevel + "</td></tr>" +
                "</table></small>";
            $("#" + bundleObject.Identifier).popover({ title: bundleObject.SymbolicName, trigger: 'hover', html: true, content: po, delay: 100, placement: placement})
        }

        function createTable() {
            var table = document.getElementById("bundleTable");
            table.parentNode.removeChild(table);

            var div = <HTMLDivElement>document.getElementById("bundleTableHolder");
            var newTable = <HTMLTableElement>document.createElement("table")
            newTable.id = "bundleTable";
            document.getElementById("bundleTableHolder").appendChild(newTable);
        }

        function render() {
            createTable();
            var filterString = $scope.display.bundleFilter === undefined ? undefined : $scope.display.bundleFilter.toLowerCase();

            for(var i = 0; i < $scope.bundles.length; i++) {
                var bundleObject = $scope.bundles[i];
                var labelText;
                if ($scope.display.bundleField === "Name") {
                    labelText = bundleObject.Name;
                    if (labelText === "") {
                        labelText = bundleObject.SymbolicName;
                    }
                } else {
                    labelText = bundleObject.SymbolicName;
                }

                if (filterString !== undefined) {
                    if (labelText.toLowerCase().indexOf(filterString) === -1) {
                        continue;
                    }
                }

                if ($scope.display.startLevelFilter > 0) {
                    if (bundleObject.StartLevel < $scope.display.startLevelFilter) {
                        continue;
                    }
                }

                addRow(bundleObject, labelText);
            }
        }

        function processResponse(response) {
            if (!Object.equal($scope.result, response.value)) {
                $scope.result = response.value;
                $scope.bundles = [];
                angular.forEach($scope.result, function (value, key) {
                    var obj = {
                        Identifier: value.Identifier,
                        Name: "",
                        SymbolicName: value.SymbolicName,
                        Fragment: value.Fragment,
                        State: value.State,
                        Version: value.Version,
                        LastModified: new Date(Number(value.LastModified)),
                        Location: value.Location,
                        StartLevel: undefined
                    };
                    if (value.Headers['Bundle-Name']) {
                        obj.Name = value.Headers['Bundle-Name']['Value'];
                    }
                    $scope.bundles.push(obj);
                });

                // Obtain start level information for all the bundles
                for(var i = 0; i < $scope.bundles.length; i++) {
                    var b = $scope.bundles[i];
                    jolokia.request({
                        type: 'exec', mbean: getSelectionBundleMBean(workspace),
                        operation: 'getStartLevel(long)',
                        arguments: [$scope.bundles[i].Identifier]
                    }, onSuccess(function(bundle, last) {
                        return function(response) {
                            bundle.StartLevel = response.value;
                            if (last) {
                                render();
                            }
                        }
                    }(b, i === ($scope.bundles.length-1))));
                }

               render();
            }
        }

        Core.register(jolokia, $scope, {
            type: 'exec', mbean: getSelectionBundleMBean(workspace),
            operation: 'listBundles()'
        }, onSuccess(processResponse));
    }
}