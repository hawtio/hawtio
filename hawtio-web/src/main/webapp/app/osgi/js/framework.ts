/**
 * @module Osgi
 */
/// <reference path="./osgiPlugin.ts"/>
module Osgi {
    _module.controller("Osgi.FrameworkController", ["$scope", "$dialog", "workspace", ($scope, $dialog, workspace:Workspace) => {
        $scope.editDialog = new UI.Dialog();

        updateContents();

        $scope.edit = (attr, displayName) => {
            $scope.editAttr = attr;
            $scope.editDisplayName = displayName;
            $scope.editDialog.open();
        }

        $scope.edited = (name, displayName, res) => {
            $scope.editDialog.close();

            if (angular.isNumber(res)) {
              var mbean = getSelectionFrameworkMBean(workspace);
              if (mbean) {
                  var jolokia = workspace.jolokia;
                  jolokia.request({
                          type: 'write', mbean: mbean, attribute: name, value: res
                      },{
                          error: function(response) { editWritten("error", response.error) },
                          success: function(response) { editWritten("success", displayName + " changed to " + res) }
                      });
              }
            }
        }

        function editWritten(status : string, message : string) {
            notification(status, message);
            updateContents();
        }

        function populatePage(response) {
            $scope.startLevel = response.value.FrameworkStartLevel;
            $scope.initialBundleStartLevel = response.value.InitialBundleStartLevel;
            Core.$apply($scope);
        }

        function updateContents() {
            var mbean = getSelectionFrameworkMBean(workspace);
            if (mbean) {
                var jolokia = workspace.jolokia;
                jolokia.request(
                    {type: 'read', mbean: mbean}, 
                    onSuccess(populatePage));
            }
        }
    }]);
}
