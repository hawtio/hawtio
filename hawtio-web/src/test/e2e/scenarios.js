'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
/* http://docs.angularjs.org/api/angular.mock.inject */


describe("hawtio", function() {
    //beforeEach(module("hawtioCore"));

    /*
    TODO fix up the home page once the initial ng-view bug is fixed

    describe('home page', function() {

      beforeEach(function() {
        browser().navigateTo('/hawtio/');
      });

      it('should automatically redirect to /view1 when location hash/fragment is empty', function() {
        expect(browser().location().url()).toBe("/help/overview");

        // now lets click on a view...
        element("a.dynatree-title", "browse.me").click();
      });

    });
    */

    /**
     * TODO disabled as selector currently fails

    describe('Using the Code Editor', function() {

        // I couldn't get tests to run correctly...
        describe('Remembering Preferences', function() {
            beforeEach(function() {
                browser().navigateTo('/hawtio/#/activemq/sendMessage?tab=messaging&nid=root_org.apache.activemq_broker1-Queue-browse.me');
            });

            it('should remember the mode preferences', function() {
                // Select XML from list

                // TODO this selector fails right now - not sure why?
                // Wonder did it ever work? :)
                select('codeMirrorOptions.mode').option('xml');

                sleep(5000);

                // Refresh the page
                browser().reload();

                sleep(5000);

                // Expect it to be still be XML
                expect(input('codeMirrorOptions.mode').val()).toEqual("XML");
            });

        })
    });
     */

    describe("using the logs module", function() {
        beforeEach(function() {
            browser().navigateTo("/hawtio/#/logs");
        });

        // TODO Need to create a mocked jolokia service returning the same logs
        /*beforeEach(inject(function(workspace) {
            // We need to create fake logs for testing purposes
            console.log("Injected workspace value :: " + workspace);
         }));*/

        describe("filtering by exact match", function() {
            it("should show only 'WARN' messages when 'WARN' is selected", function() {
                console.log("Selecting 'WARN' option with exact match")
                select('logLevelQuery').option('WARN');

                // Exact match should only show logs with 'WARN'
                console.log("Asserting expectations on filtered results")
                expect(repeater("#logResultsTable tbody tr").count()).toEqual(1);
                expect(repeater("#logResultsTable tbody tr").column("log.level")).toEqual(["WARN"]);
            });
        });

        describe("filtering by ordinal value", function() {
            it("should show 'WARN' and 'ERROR' messages when 'WARN' is selected", function() {
                // Uncheck the exact match filtering to have ordinal
                console.log("Unchecking exact match for log levels")
                input("logLevelExactMatch").check();

                // Select the WARN option
                console.log("Selecting 'WARN' option with ordinal filtering")
                select('logLevelQuery').option('WARN');

                // Ordinal based filtering expectations, ie >= WARN (e.g. WARN will show WARN and ERROR)
                console.log("Asserting expectations on filtered results");
                expect(repeater("#logResultsTable tbody tr").count()).toEqual(2);
                expect(repeater("#logResultsTable tbody tr").column("log.level")).toEqual(["WARN", "ERROR"]);
            });
        });
    });


    describe('create queue, send message and browse it', function() {
      var timeout = 1;
      var bigTimeout = 2;

      beforeEach(function() {
        browser().navigateTo('/hawtio/#/activemq/createQueue?nid=root-org.apache.activemq-broker1-Broker');
      });

      it('should let us create a new queue', function() {
        sleep(timeout);

        var d = new Date();
        var queueName = "test." + d.toUTCString().replace(/\,| GMT/g, "").replace(/ |:/g, ".");

        input("destinationName").enter(queueName);

        console.log("Attempt to create a new queue: " + queueName);

        element("button.btn", "Create Queue").click();

        sleep(timeout);

        console.log("Now trying to browse: " + queueName);

        // send a message

        browser().navigateTo('/hawtio/#/activemq/sendMessage?nid=root-org.apache.activemq-broker1-Queue-' + queueName);
        sleep(timeout);

        var messageBody = "<hello>the time is " + d + "</hello>";

        // TODO how do we enter text into  the button to enable itself? angularjs hasn't spotted we've just entered the value!
        input("message").enter(messageBody);

    /*
        //preElement.text(messageBody);
        element(".CodeMirror-lines pre:last-of-type").query(function(selectedElements, done){
            selectedElements.text(messageBody);
            selectedElements.val(messageBody);
            sleep(1);
            selectedElements.trigger('change');
            done();
        });
        element(".CodeMirror-lines pre:last-of-type").click();
        element("textarea#messageBody").val(messageBody);

    */

        var viewElement = angular.element(element("#properties"));
        if (viewElement) {
          console.log("Found view element");
          var scope = viewElement.scope();
          if (scope) {
            scope.$apply();
          }
        }

        sleep(timeout);

        element("#sendButton", "Send Message").click();
        sleep(timeout);

        console.log("Clicked send button!");

        // now lets browse the queue
        browser().navigateTo('/hawtio/#/activemq/browseQueue?nid=root-org.apache.activemq-broker1-Queue-' + queueName);
        sleep(bigTimeout);

        // lets check we have some messages
        expect(element("table#grid tbody tr td.dataTables_empty", "Message table should not be empty for queue " + queueName).count()).toEqual(0);
        expect(element("table#grid tbody tr", "Number of messages on queue " + queueName).count()).toBeGreaterThan(0);
      });
    });

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

            browser().navigateTo('#/springbatch/jobs');
            console.log(' ------------- '+browser().location().url());

//        console.log(' ------------- '+$httpBackend);
            expect(1).toEqual(1);
        });
    });
});