module SpringBatch {
    export function NavBarController($scope, $routeParams, $location, workspace:Workspace) {

        var subLevelTabs =[
            {uri:'servers',name:'Servers List'} ,
            {uri:'jobs/executions',name:'Jobs Execution List'},
            {uri:'connect',name:'Connect'}
        ];

        $scope.subLevelTabs = subLevelTabs;

        $scope.isActive = (tab) => {
            return ('/springbatch/'+tab.uri === $location.path());
        };
    }
}