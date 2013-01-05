'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

/*
describe('home page', function() {

  beforeEach(function() {
    browser().navigateTo('../../index.html');
  });

  it('should automatically redirect to /view1 when location hash/fragment is empty', function() {
    expect(browser().location().url()).toBe("/help/overview");

    // now lets click on a view...
    element("a.dynatree-title", "browse.me").click();
  });

});
*/


describe('create queue, send message and browse it', function() {

  var timeout = 2;
  var bigTimeout = 5;

  console.log("========= About to log some stuff!!!");

  beforeEach(function() {
    browser().navigateTo('/hawtio/#/createQueue?nid=root_org.apache.activemq_broker1_Queue');
  });

  it('should let us create a new queue', function() {
    console.log("Starting!!!");

    sleep(timeout);

    var queueName = "new.thing4";
    input("destinationName").enter(queueName);

    console.log("Attempt to create a new queue");

    element("button.btn", "Create Queue").click();

    sleep(timeout);

    console.log("Now trying to browse...");


    // send a message

    browser().navigateTo('/hawtio/#/sendMessage?nid=root_org.apache.activemq_broker1_Queue_' + queueName);
    sleep(timeout);

    var messageBody = "<hello>world!</hello>";

    // TODO how do we enter text into  the button to enable itself? angularjs hasn't spotted we've just entered the value!
    element(".CodeMirror-lines pre:last-of-type").text(messageBody);
    input("message").enter(messageBody);
/*
    element(".CodeMirror-lines pre:last-of-type").click();
    element("textarea#messageBody").val(messageBody);
*/


    sleep(10);
    sleep(timeout);

    console.log("Attempt to send to the destination");

    element("#sendButton", "Send Message").click();


    // now lets browse the queue

    browser().navigateTo('/hawtio/#/browseQueue?nid=root_org.apache.activemq_broker1_Queue_' + queueName);
    sleep(bigTimeout);

    var values = element("table#grid tbody tr");
    console.log("Found elements " + values);
    console.log("Found element count " + values.count());

    // lets assert that we have some messages!
    expect(element("table#grid tbody tr td.dataTables_empty", "Message table should not be empty for queue " + queueName).count()).toEqual(0);
    expect(element("table#grid tbody tr", "Number of messages on queue " + queueName).count()).toBeGreaterThan(0);
  });
});
