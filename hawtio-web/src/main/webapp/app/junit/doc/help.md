### JUnit

The [JUnit](#/junit/tests/) plugin in [hawtio](http://hawt.io "hawtio") gives a raw view of the underlying JMX metric data, allowing access to the entire JMX domain tree of MBeans.

##### JUnit Tree #####

The topmost level of the JUnit tree view lists all the JUnit @Test classed currently within the running JVM.

![JUnit Tree](app/junit/doc/img/junit-tree.png "JUnit Tree")

Click the <i class='icon-chevron-right'></i> icon to expand a tree item and further navigate into Java packages.


##### Testing #####

On the main view area is a table that lists all the unit test classes from the selected Java package in the JUnit Tree (will list all test classes by default).

![JUnit Tests](app/junit/doc/img/junit-tests.png "JUnit Tests")

You can select any number of unit test classes to run as unit tests.

During testing there is a test summary which reports the progress.

![JUnit Testing](app/junit/doc/img/junit-testing.png "JUnit Testing")

.. and when the tests finishes the failed tests is listed, which can be expanded, to see any stacktrace with the failure.


##### Other Functionality #####

The [JUnit](#/junit/) can be used together with the [Test Maven Plugin](http://hawt.io/maven/) which can be used to startup
the hawtio console of a given Maven project, with unit test classes included in the classpath, allowing the [JUnit](#/junit/)
to be used to start the tests, while using the rest of the functionality of hawtio to inspect live data while the test runs.
