'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

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

describe('Using the Code Editor', function() {

    // I couldn't get tests to run correctly...
    describe('Remembering Preferences', function() {
        beforeEach(function() {
            browser().navigateTo('/hawtio/#/activemq/sendMessage?tab=messaging&nid=root_org.apache.activemq_broker1_Queue_browse.me');
        });

        it('should remember the mode preferences', function() {
           // Select XML from list
            select('codeMirrorOptions.mode').option('xml');

            // Refresh the page
            browser().reload();

            // Expect it to be still be XML
            expect(input('codeMirrorOptions.mode').val()).toEqual("XML");
        });

    })
});

// Commented out be cause I couldn't find out how to ignore tests in jasmine -.-
describe('create queue, send message and browse it', function() {
  var timeout = 1;
  var bigTimeout = 2;

  beforeEach(function() {
    browser().navigateTo('/hawtio/#/activemq/createQueue?nid=root_org.apache.activemq_broker1_Queue');
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

    browser().navigateTo('/hawtio/#/activemq/sendMessage?nid=root_org.apache.activemq_broker1_Queue_' + queueName);
    sleep(timeout);

    var messageBody = "<hello>the time is " + d + "</hello>";

    // TODO how do we enter text into  the button to enable itself? angularjs hasn't spotted we've just entered the value!
    //preElement.text(messageBody);
    element(".CodeMirror-lines pre:last-of-type").query(function(selectedElements, done){
        selectedElements.text(messageBody);
        selectedElements.val(messageBody);
        sleep(1);
        selectedElements.trigger('change');
        done();
    });
    input("message").enter(messageBody);
    element(".CodeMirror-lines pre:last-of-type").click();
    element("textarea#messageBody").val(messageBody);


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
    browser().navigateTo('/hawtio/#/activemq/browseQueue?nid=root_org.apache.activemq_broker1_Queue_' + queueName);
    sleep(bigTimeout);

    // lets check we have some messages
    expect(element("table#grid tbody tr td.dataTables_empty", "Message table should not be empty for queue " + queueName).count()).toEqual(0);
    expect(element("table#grid tbody tr", "Number of messages on queue " + queueName).count()).toBeGreaterThan(0);
  });
});
