module SpringBatch {
    export function NavBarController($scope, $routeParams, $location, workspace:Workspace) {

        var subLevelTabs =[
            {uri:'jobs',name:'Jobs List'} ,
            {uri:'jobs/executions',name:'Jobs Execution List'},

        ];

        $scope.subLevelTabs = subLevelTabs;

        $scope.isActive = (tab) => {
            return workspace.isLinkActive('#/springbatch/'+tab.uri);
        };
    }
}