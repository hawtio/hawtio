module SpringBatch {
    export function NavBarController($scope, $routeParams, $location, workspace:Workspace) {

        var subLevelTabs =[
            {uri:'jobs',name:'Jobs List'} ,
            {uri:'jobs/executions',name:'Jobs Execution List'},
            {uri:'connect',name:'Connect'}
        ];

        $scope.subLevelTabs = subLevelTabs;

        $scope.isActive = (tab) => {
            return ('/springbatch/'+tab.uri === $location.path());
        };
    }
}