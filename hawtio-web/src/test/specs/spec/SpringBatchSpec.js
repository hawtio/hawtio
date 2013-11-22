/**
 * User: prashant
 * Date: 20/11/13
 * Time: 6:04 PM
 * To change this template use File | Settings | File Templates.
 */
describe("NavBarController", function () {

    beforeEach(module('SpringBatch'));

    var  $httpBackend;
    var ctrl;
    var scope;
    var location;



    beforeEach(function () {
        console.log(' ------ mock ------- '+angular.mock);
        angular.mock.inject(function (_$httpBackend_, _$rootScope_, _$location_, $controller) {
            $httpBackend = _$httpBackend_;
            scope = _$rootScope_.$new();
            location = _$location_;
            Cntrl = $controller('SpringBatch.NavBarController',{
                $scope:scope,
                $location:location
            });
//            console.log(' ------ mock 2 ------- '+Cntrl);
        })
    });

    it("sample spring batch test", function () {
//        var jsonResponse = '{"jobs":{"resource":"http://localhost:8080/spring-batch-admin-sample/jobs.json","registrations":{"job2":{"name":"job2","resource":"http://localhost:8080/spring-batch-admin-sample/jobs/job2.json","description":"No description","executionCount":0,"launchable":true,"incrementable":false},"job1":{"name":"job1","resource":"http://localhost:8080/spring-batch-admin-sample/jobs/job1.json","description":"No description","executionCount":0,"launchable":true,"incrementable":true}}},"$resolved":true}';
//        $httpBackend.expectGET('/hawtio/proxy/localhost:8080/spring-batch-admin-sample/jobs.json').respond(jsonResponse);
        console.log(' ------ log 2 ------- ' + scope.subLevelTabs);
        expect(1).toEqual(1);
    });
});
