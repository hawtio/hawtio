/**
 * User: prashant
 * Date: 20/11/13
 * Time: 6:04 PM
 * To change this template use File | Settings | File Templates.
 */
describe("SpringBatch", function () {
    var  $httpBackend;

    beforeEach(function () {
        angular.mock.inject(function ($injector) {
            $httpBackend = $injector.get('$httpBackend');
        })
    });

    it("sample spring batch test", function () {
//        $httpBackend.expectGET('/hawtio/proxy/localhost:8080/spring-batch-admin-sample/jobs.json')
//            .respond('{"jobs":{"resource":"http://localhost:8080/spring-batch-admin-sample/jobs.json","registrations":{"job2":{"name":"job2","resource":"http://localhost:8080/spring-batch-admin-sample/jobs/job2.json","description":"No description","executionCount":0,"launchable":true,"incrementable":false},"job1":{"name":"job1","resource":"http://localhost:8080/spring-batch-admin-sample/jobs/job1.json","description":"No description","executionCount":0,"launchable":true,"incrementable":true}}},"$resolved":true}');

//        browser().navigateTo('#/springbatch/jobs');
        console.log(' ------------- '+browser());
//        console.log(' ------------- '+$httpBackend);
        expect(1).toEqual(1);
    });
});
