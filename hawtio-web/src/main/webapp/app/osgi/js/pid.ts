module Osgi {
    export function PidController($scope, $filter:ng.IFilterService, workspace:Workspace, $routeParams) {
        $scope.deleteConfirmDialog = new Core.Dialog();
        $scope.addPropertyDialog = new Core.Dialog();
        $scope.pid = $routeParams.pid;

        updateTableContents();

        $scope.pidSave = function() {
            var table = document.getElementById("configValues");

            var els : any = table.getElementsByClassName("pid-value");
            var props = "";
            var td = {};
            for (var i = 0; i < els.length; i++) {
                props += "\n " + els[i].previousElementSibling.textContent + " " + els[i].textContent;
                td[els[i].previousElementSibling.textContent] = els[i].textContent;
            }

            var mbean = getHawtioConfigAdminMBean(workspace);
            if (mbean) {
                var jolokia = workspace.jolokia;
                jolokia.request({
                        type: "exec",
                        mbean: mbean,
                        operation: "configAdminUpdate",
                        arguments: [$scope.pid, JSON.stringify(td)]
                    }, {
                        error: function(response) {
                            notification("error", response.error);
                        },
                        success: function(response) {
                            enableSave(false);
                            notification("success", "Successfully updated pid: " + $scope.pid);
                        }
                    });
            }
        }

        $scope.addPropertyConfirmed = function(key, value) {
            $scope.addPropertyDialog.close();
            $scope.row[key] = {
                Key: key,
                Value: value,
                Type: "String"
            };
            enableSave(true);
        }

        $scope.deletePidProp = (e) => {
            $scope.deleteKey = e.Key;
            $scope.deleteConfirmDialog.open();
        }

        $scope.deletePidPropConfirmed = () => {
            $scope.deleteConfirmDialog.close();
            var cell : any = document.getElementById("pid." + $scope.deleteKey);
            cell.parentElement.remove();
            enableSave(true);
        }

        function jmxError(response) {
            notification("error", "Oops: " + response);
        }

        function populateTable(response) {
            $scope.row = response.value
            $scope.$apply();
        };

        function updateTableContents() {
            var mbean = getSelectionConfigAdminMBean(workspace);
            if (mbean) {
                var jolokia = workspace.jolokia;
                jolokia.request(
                    {type: 'exec', mbean: mbean, operation: 'getProperties', arguments: [$scope.pid]},
                    onSuccess(populateTable));
            }
        }
    };

    export function editPidValueCell(e) {
        e.contentEditable = true;
        enableSave(true);
    }

    function enableSave(enablement : boolean) {
        var saveBtn = document.getElementById("saveButton");
        saveBtn.disabled = !enablement;
    }
}
