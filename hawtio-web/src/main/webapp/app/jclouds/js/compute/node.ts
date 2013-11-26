/**
 * @module Jclouds
 */
module Jclouds {

    export function NodeController($scope, $filter:ng.IFilterService, workspace:Workspace, $routeParams) {
        $scope.computeId = $routeParams.computeId
        $scope.nodeId = $routeParams.nodeId;

        updateTableContents();

        function setNode(api) {
            $scope.row = api;
            Core.$apply($scope);
        };


        function updateTableContents() {
            var computeMbean = getSelectionJcloudsComputeMBean(workspace, $scope.computeId);
            var jolokia = workspace.jolokia;

            if (computeMbean) {
                setNode(jolokia.request(
                    { type: 'exec', mbean: computeMbean, operation: 'getNode(java.lang.String)', arguments: [$scope.nodeId]}).value
                );
            }
        }

        $scope.resume = () => {
            resumeNode(workspace, workspace.jolokia, $scope.computeId, $scope.nodeId, function () {
                console.log("Resumed!")
            }, function () {
                console.log("Failed to resume!")
            });
        }

        $scope.suspend = () => {
            suspendNode(workspace, workspace.jolokia, $scope.computeId, $scope.nodeId, function () {
                console.log("Suspended!")
            }, function () {
                console.log("Failed to suspend!")
            });
        }

        $scope.reboot = () => {
            rebootNode(workspace, workspace.jolokia, $scope.computeId, $scope.nodeId, function () {
                console.log("Rebooted!")
            }, function () {
                console.log("Failed to reboot!")
            });
        }

        $scope.destroy = () => {
            destroyNode(workspace, workspace.jolokia, $scope.computeId, $scope.nodeId, function () {
                console.log("Destroyed!")
            }, function () {
                console.log("Failed to destroy!")
            });
        }
    }
}
