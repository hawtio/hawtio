/// <reference path="./springbatchPlugin.ts"/>
module SpringBatch {
    _module.controller("SpringBatch.NavBarController", ["$scope", "$routeParams", "$location", "workspace", ($scope, $routeParams, $location, workspace:Workspace) => {

        var subLevelTabs =[
            {uri:'servers',name:'Servers List'} ,
            {uri:'jobs/executions',name:'Jobs Execution List'},
            {uri:'connect',name:'Connect'}
        ];

        $scope.subLevelTabs = subLevelTabs;

        $scope.isActive = (tab) => {
          return false;
            // TODO: spring-batch is not complete
            // return ('/springbatch/'+tab.uri === $location.path());
        };
    }]);
}
