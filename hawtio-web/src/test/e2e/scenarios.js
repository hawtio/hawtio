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

  console.log("========= About to log some stuff!!!");

  beforeEach(function() {
    browser().navigateTo('../../index.html');
    browser().navigateTo('#/createQueue?nid=root_org.apache.activemq_broker1_Queue');
  });

  it('should let us create a new queue', function() {
    console.log("Starting!!!");

    sleep(2);

    var queueName = "new.thing2";
    input("destinationName").enter(queueName);

    console.log("Attempt to create a new queue");

    element("button.btn", "Create Queue").click();


    sleep(2);

    console.log("Now trying to browse...");

    // now lets browse the queue
    browser().navigateTo('#/browseQueue?nid=root_org.apache.activemq_broker1_Queue_' + queueName);

    sleep(2);

    var values = element("table#grid tbody tr");
    console.log("Found elements " + values);
    console.log("Found element count " + values.count());

    // lets assert that we have some messages!
    //expect(element("tr", "Number of messages on queue " + queueName).count()).toBeGreaterThan(0);
    expect(element("tr").count()).toBeGreaterThan(0);
  });
});
