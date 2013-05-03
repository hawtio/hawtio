# hawtio change log

# 1.1

* Added the following new plugins:

  * [forms](https://github.com/hawtio/hawtio/blob/master/hawtio-web/src/main/webapp/app/forms/doc/developer.md) a developer plugin for automatically creating tables and forms from json-schema models 
  * [infinispan](http://hawt.io/plugins/infinispan/) for viewing metrics for your Infinispan caches or using the CLI to query or update them
  * [jclouds](http://hawt.io/plugins/jclouds/) to help make your cloud hawt
  * [maven](http://hawt.io/plugins/maven/) to let you search maven repositories, find versions, view source or javadoc
  * [tree](https://github.com/hawtio/hawtio/blob/master/hawtio-web/src/main/webapp/app/tree/doc/developer.md) a developer plugin to make it easier to work with trees

* Added a new real time Camel profile view and the first version of a web based wiki based camel editor along with improvements to the diagram rendering

* Added more flexible documentation system so that plugins are now self documenting for users and developers

* Fixes [these 47 issues and enhancements](https://github.com/hawtio/hawtio/issues?milestone=2&state=closed)


# 1.0

* First main release of hawtio with [lots of hawt plugins](http://hawt.io/plugins/index.html).
* Fixes [these 74 issues and enhancements](https://github.com/hawtio/hawtio/issues?milestone=1&state=closed)


# In Progress (1.2)

* New _JVMs_ tab lets you connect to remote JVMs on your local machine; which if a JVM does not have jolokia installed it will install it on the fly.
  * this tab also now includes the Connect logic to connect to a remote JVM (and its now been removed from the Preferences page)
* Huge improvements in the ActiveMQ tooling; so we can more easily page through messages on a queue, move messages, delete them, retry messages on a DLQ (in 5.9.x of ActiveMQ onwards)
* Neater Camel message tracing; letting you zoom into a message and step through the messages with video player controls
* Can now forward messages on a Camel endpoints


