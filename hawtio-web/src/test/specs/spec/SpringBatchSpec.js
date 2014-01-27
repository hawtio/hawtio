describe("SpringBatch", function () {

    var $rootScope;
    var $location;
    var $routeParams;

    beforeEach(function () {

        angular.mock.inject(function ($injector) {
            $rootScope = $injector.get('$rootScope');
            $location = $injector.get('$location');
            $routeParams = $injector.get('$routeParams');
        })

    });

  /*
  TODO - look into what order the tabs should be
    it("spring batch sub level tabs", function () {

        var scope = $rootScope.$new();
        SpringBatch.NavBarController(scope, $routeParams, $location);

        expect(scope.subLevelTabs[0].uri).toEqual('jobs');
        expect(scope.subLevelTabs[1].uri).toEqual('jobs/executions');
        expect(scope.isActive({uri:'jobs',name:'No tab'})).toEqual(false);
    });
  */
});

