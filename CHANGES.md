
### Change Log

#### 1.5.5 (To be released)

* Upgraded to Camel 2.20.0

#### 1.5.4

* Fixed hawtio spring-boot starter to adhere to `management.port` property
* Various bug fixes

#### 1.5.3

* Quartz plugin can now be triggered manually via play button
* Upgraded to Jolokia 1.3.7
* Upgraded to Camel 2.19.2
* Various bug fixes

#### 1.5.2

* Added a new java.lang.Runtime plugin
* IDE plugin modification and update
* Various fixes and improvements
* Upgraded to Camel 2.19.1
* Upgraded to JGit 4.8.x

#### 1.5.1

* New Diagnostics plugin using JVM Flight Recorder
* Proxy whitelist is automatically constructed based on network interfaces for local machine.
  You can continue to use `hawtio.proxyWhitelist` system properties for further customisation.
* Proxy whitelist supports regex by prefixing them with `r:` in the `hawtio.proxyWhitelist` system property
* Upgraded to Camel 2.19.0
* Upgraded to Spring Boot 1.5.3
* Upgraded to Jolokia 1.3.6
* Upgraded to JGit 4.7.x
* Various bug fixes

#### 1.5.0

* Hawtio 1.5 requires Java 1.8 onwards
* Turned `ProxyServlet` to whitelist-based host selection model for security reasons.
  Now only `localhost` / `127.0.0.1` is allowed in the remote JVM connect plugin by default.
  To connect to other hosts you need to add them to whitelist either at `proxyWhitelist`
  init parameter in `web.xml` or through `hawtio.proxyWhitelist` system property.
* Upgraded to Camel 2.18.2
* Upgraded to Spring Boot 1.5.1

Hawtio 1.4.x is now in maintenance mode.

#### 1.4.68

* Fixed hawtio-wildfly to run on WildFly / JBoss EAP even after JBoss RBAC is enabled
* Fixed an issue whereby many pages where flickering
* Upgraded to Camel 2.18.1
* The Karaf Terminal plugin now works again when using Karaf 4.0.7 or newer.

#### 1.4.67

* Fixed hawtio-app may not start due two different versions of http-client included.

#### 1.4.66

* Now every Jolokia call within Hawtio is checked based on RBAC. This means Hawtio is made more secure, but
  you may also encounter a bunch of access exceptions. Most of those exceptions are not a Hawtio bug, but
  just indicate lack of some necessary RBAC configurations on the container, e.g. Karaf ACL files.
  You can resolve those exceptions by fulfilling the required configurations on the running container.
* Added support for customization of Jolokia through Java system properties, i.e.:
  `-Djolokia.policyLocation=file:///home/fuse/my-access.xml`
* Added new pages to the ActiveMQ plugin for monitoring brokers with large number of destinations
* Improved KeyCloak plugin to better support WildFly and EAP
* Various fixes and improvements for RBAC on Hawtio web UI
* Upgraded to Camel 2.18.0
* Upgraded to Jolokia 1.3.5
* KeyCloak updated to 2.2.1

#### 1.4.65

* Upgraded to Camel 2.17.1
* The Camel JMX domain name can be configured in the preference
* Various other small bug fixes

#### 1.4.64

* Added more icons for various Camel endpoints and a few more EIPs
* Upgraded to Camel 2.17.0
* Various other small bug fixes

#### 1.4.63

* hawtio can be installed in Apache Karaf 2.4.x again if you install the `hawtio-core` feature. Log and Terminal plugin is not supported on Karaf 2.x.
* upgraded to KeyCloack 1.9.1

#### 1.4.62

* Add `hawtio:type=security,name=RBACRegistry` JMX bean that provides optimized version of Jolokia `list` operation.
  Normally, Jolokia fetches and marshalls each MBeanInfo it can find. When there are thousands of same MBeanInfos
  (like ActiveMQ queues or Camel processors/endpoints/routes/...) it was very inefficient. Now the MBeanInfo
  is shared in special cases which greatly improves performance.
* When displaying a table of JMX attributes for a list of MBeans, data is fetched only for visible (non-filtered)
  objects. After clearing/changing filter, old Jolokia requests are unregistered and new ones are created.
* Fixed the AcitveMQ plugin to show the browse message dialog again, after it has been closed previously.
* Increased the default jolokia max collection limit from 5000 to 50000 to ensure JVMs with many mbeans are all populated in hawtio
* Removed a bunch of outdated help pages in the plugins to trim down the distribution size.
* Added back the missing icons for the Camel debugger which was missing in the previous release.
* Add option to control whether hawtio should automatic open the web console in the browser or not, when running hawtio-app.
* Hawtio now supports url links to auto connect remote JVMs where the options is provided as url parameters in the link.
      such as: /hawtio/index.html#/jvm/connect?name=xxx&host=xxx&port=xxx&path=xxx&userName=xxx&password=xxx
      (where you replace xxx with the desired values)

#### 1.4.61

* ActiveMQ browse messages now show the table quicker when data retrieved
* ActiveMQ move dialog uses a selectbox instead of type ahead which could be buggy in some browsers
* Upgrade to Jolokia 1.3.3
* Jolokia is set to not return error details to avoid exposing stacktraces from the JVMs

#### 1.4.60

* Fixed hawtio-app to scan for 3rd party plugins in `--pluginsDir` to work on Windows
* Added a copy to clipboard button on the Camel and ActiveMQ message browser
* The Camel filter box now works better to filter all kinds of nodes in the tree
* Fixed issue with remote Jolokia cannot send message to ActiveMQ queue/Camel endpoint
* Add spring-boot as goal to the hawtio-maven-plugins.
* Upgraded to Camel 2.16.2

#### 1.4.59

* Camel plugin able to show message history metrics if using Camel 2.17 onwards
* Camel route diagram now allows to select which routes to display
* Dashboard plugin is now enabled again

#### 1.4.58

* When using ActiveMQ the hawtio web console no longer causing the tree to continuesly being updated, which otherwise will cause the web UI to be sluggish. Notice the reason for the update is becuse of ActiveMQ and end user may not use pooled connections or is using XA with no consumer cache. In either case hawtio now filter out those events to avoid triggering the web console UI to be updated constantly.
* The hawtio-maven-plugin now waits 3 seconds before opening the web-console which allows the JVM to startip Camel and other services to be ready prior to the web console. The delay can be configured.
* The karaf terminal plugin requires Karaf 4.x (2.x/3.x no longer supported)
* Upgraded to Camel 2.16.1

#### 1.4.57

* hawtio-maven-plugin camel goal - Now supports using mainClass configured from the camel-maven-plugin, so it uses that out of the box
* Fixed an issue with the spring-boot plugin with base urls

#### 1.4.56

* Camel plugin - Now groups the properties into tabs so viewing endpoint properties with many options is using multi-tabs to group the options.
* Added camel-cdi as goal to the [maven](http://hawt.io/maven/) plugin to allow starting a Camel CDI application with hawtio embedded.
* Fixed so JUnit plugin is not shown by default when there is no unit tests in the JVM to run.
* Removed the kubernetes plugin which are only part of hawtio 2.x
* Remove the apollo plugin as it was never complete and ActiveMQ Apollo is a dead project.
* Ported the fabric8-insight-log to hawtio-insight-log so we have the source code and maintain out of the box in the hawtio project
* The Log plugin works again in Karaf containers (requires Karaf 3.0 or higher)

#### 1.4.55

* Upgrade to Camel 2.16.0
* Upgrade to Jolokia 1.3.2
* Camel plugin - Can list and show detailed information about how each data format has been configured (requires Camel 2.16 onwards)
* Camel plugin - Can list and show detailed information about how each component has been configured

#### 1.4.54

* Camel plugin - Route diagram can now show all routes

#### 1.4.53

* Camel plugin can now show in/out endpoints when using Camel 2.16 onwards
* Camel plugin can now show blocked exchanges when using Camel 2.15 onwards
* Various fabric8 v1 bugs and cosmetic issues fixed
* The remote JVM connect plugin now uses the browser dialog for username/password which allows to use the browser for storing these secured (using browser plugins such as safepass or others)
* Fabric - when deleting profiles from wiki pages, a warning is shown when some containers use the profiles
* OSGi - better filtering of bundles
* Upgrade to frontend-maven-plugin 0.0.24 - will work with Maven 3.3.3
* Sorting of simple tables works again
* Camel - fixes to "full screen" (notree) mode
* Dashboard - fixed navigation on "manage" view

#### 1.4.52

* Upgrade to Jolokia 1.3.1
* Authentication with JBoss EAP 6.x now matches user roles correctly

#### 1.4.51

* Upgrade to Jolokia 1.3.0
* Upgrade to Camel 2.15.2
* Kubernetes plugin supports v1beta2 kubernetes api

#### 1.4.50

* Connect plugin no longer shows welcome screen when connecting to other JVMs
* Fixed issue with missing dangle module from 1.4.49 release.
* Fixed so the dashboard plugin is visible again
* The wiki plugin is disabled for non fabric JVMs
* Jetty 7 is no longer used for testing and is considered deprecated. Jetty 8 is used as default for testing.
* ActiveMQ and Camel plugin now hides the choose sub tab in the send message dialog; as that is only in use when using fabric8 v1
* OSGi plugin now shows feature and server details for Karaf 3.x onwards
* Other [minor isseues fixed](https://github.com/hawtio/hawtio/issues?q=milestone%3A1.4.50+is%3Aclosed)

#### 1.4.49

* Running hawtio on Apache Tomcat with users defined in `tomcat-users.xml` now supports specifying the password hashed algorithm to use.
* Upgrade to Camel 2.15.1
* Camel plugin: Clicking on a EIP/node in the Route Diagram redirects to the selected EIP properties page
* Camel plugin: Fixed inflight page didnt clear data if no longer any exchanges inflight
* Camel plugin: Fixed endpoint properties to show option names correctly when the option has a label associated
* Various fixes and improvements for Fabric 1.x plugin
* Fixed Karaf terminal to avoid potentially sending duplicat keys
* Other bug fixes as part of hardening hawtio for JBoss Fuse 6.2 product

#### 1.4.47 ... 1.4.48

* Update ng-grid to version 2.0.14
* Fabric - show default version in Wiki pages
* Camel 2.15 - Add endpoint documentation when selecting endpoints
* Upgrade to Camel 2.15.0
* Camel plugin - Properties sub tab improvements
* Use model json from Camel
* hawtio-jboss is now hawtio-wildfly
* hawtio-wildfly - add sensible defaults for integration with Wildfly security realms

#### 1.4.46

* Camel plugin now includes up to date model with EIP documentation included
* Camel plugin reworked properites page to present more information about the EIP
* Camel plugin can now show endpoint properties with documentation included (requires Camel 2.15 onwards)
* The Camel model is auto generated as part of the build using Apache Camel 2.15.0 onwards (but up to date with current Apache Camel in this release)
* Hawtio can now be secured using KeyCloak

#### 1.4.45

* Camel plugin supports new inflight exchanges from Camel 2.15 onwards
* Fixed Camel plugin to show convertBodyTo in the route diagram

#### 1.4.38 ... 1.4.44

* Camel tracer and debugger now shows message bodies that are stream/file based
* Camel message browser now shows the java types of the headers and body
* Various improvements for fabric8 v2
* Various bug fixes

#### 1.4.37

* Ported the [API console to work on Kubernetes](https://github.com/hawtio/hawtio/issues/1743) so that the APIs tab appears on the Kubernetes console if you run hawtio inside Kubernetes and are running the [API Registry service](https://github.com/fabric8io/quickstarts/tree/master/apps/api-registry)
* Adds [Service wiring for Kubernetes](https://github.com/hawtio/hawtio/blob/master/docs/Services.md) so that its easy to dynamically link nav bars, buttons and menus to remote services running inside Kubernetes (e.g. to link nicely to Kibana, Grafana etc).
* Various [bug fixes](https://github.com/hawtio/hawtio/issues?q=milestone%3A1.4.37+is%3Aclosed)


#### 1.4.36 ... 1.4.32

* Bug fixes
* Allow to configure `TomcatAuthenticationContainerDiscovery` classes to control how hawtio authenticates on Apache Tomcat
* Excluded some not needed JARs as dependencies
* Various improvements and fixes needed for fabric8 v2

#### 1.4.31

* Added hawtio-custom-app module to create a version of the hawtio-default war with a subset of the javascript code normally included in hawtio.
* Fixes [these 6 issues and enhancements](https://github.com/hawtio/hawtio/issues?q=milestone%3A1.4.31+is%3Aclosed)

#### 1.4.30

* Bug fixes
* Fixed Camel diagram to render in Firefox browser
* Hawtio Karaf Terminal now installs and works in Karaf 2.x and 3.0.x out of the box
* Upgraded to TypeScript 1.1.0
* Fixed jolokia connectivity to Java containers with jolokia when running Kubernetes on RHEL / Fedora / Vagrant
* Fixes [these 14 issues and enhancements](https://github.com/hawtio/hawtio/issues?q=milestone%3A1.4.30+is%3Aclosed)

#### 1.4.29

* Bug fixes

#### 1.4.28

* Bug fixes

#### 1.4.27

* Reworked proxy
* Minor fixes to git file manipulation & RBAC

#### 1.4.26

* You can now drag and drop files onto the wiki file listing; or from a file listing to your desktop/folders.
* Fixes [these 2 issues and enhancements](https://github.com/hawtio/hawtio/issues?q=milestone%3A1.4.26)

#### 1.4.25

* Lots of improvements for using hawtio as a great console for working with [fabric8 V2](http://fabric8.io/v2/index.html), [kubernetes](http://kubernetes.io/) and [OpenShift](https://github.com/openshift/origin)
* Fixes [these 8 issues and enhancements](https://github.com/hawtio/hawtio/issues?q=milestone%3A1.4.25+is%3Aclosed)

#### 1.4.24

* A new kuberetes plugin which now links to the hawtio console for any JVM which exposes the jolokia port (8778)
* Fixes session filter issue

#### 1.4.23

* Bug fixes
* Fixes [these 31 issues and enhancements](https://github.com/hawtio/hawtio/issues?q=milestone%3A1.4.23)

#### 1.4.22

* Bug fixes
* Fixed hawtio connector to work with local and remote connections again
* Fixes [these 17 issues and enhancements](https://github.com/hawtio/hawtio/issues?q=milestone%3A1.4.22)

#### 1.4.21

* Bug fixes
* Optimized application initial load time, and added source mappings so view source works in browsers to aid javascript debugging
* Added support for [kubernetes](http://fabric8.io/gitbook/kubernetes.html) with fabric8
* Hawtio terminal now also supports Karaf 2.4.x / 3.x (though requires some customization to enable hawtio-plgiin in Karaf ACL)
* Fixes [these 7 issues and enhancements](https://github.com/hawtio/hawtio/issues?q=milestone%3A1.4.21)

#### 1.4.20

* Bug fixes
* The source code can now be [built](http://hawt.io/building/index.html) without installing npm, just use plain Apache Maven.
* Hawtio terminal now also supports Karaf 3.x
* Fixed an issue deploying hawtio-war into WebLogic
* Fixes [these 10 issues and enhancements](https://github.com/hawtio/hawtio/issues?q=milestone%3A1.4.20)

#### 1.4.19

* Bug fixes
* Fixed so hawtio deploys out-of-the-box in Apache Tomcat and Apache ServiceMix 5.1
* Fixes [these 46 issues and enhancements](https://github.com/hawtio/hawtio/issues?q=milestone%3A1.4.19)

#### 1.4.18

* Hawtio requires Java 1.7 onwards
* Authentication now detects if running on WebSphere, and adapts authentication to WebSphere specific credentials and APIs
* Filter now allow to filter by multi values separated by comma
* Camel sub tab for route metrics when using the new camel-metrics component
* Bug fixes

#### 1.4.17

* Bug fixes

#### 1.4.16

* Bug fixes

#### 1.4.14

* Upgrades to jaxb, jackson, dozer and spring to play nicer with the latest [fabric8](http://fabric8.io/) distro
* Fixes [these 5 issues and enhancements](https://github.com/hawtio/hawtio/issues?q=milestone%3A1.4.14+is%3Aclosed)

#### 1.4.12

* [fabric8](http://fabric8.io/) plugin has an improved Containers page and the start of a nice deploy UI with draggy droppy
* Fixes [these 10 issues and enhancements](https://github.com/hawtio/hawtio/issues?q=milestone%3A1.4.12+is%3Aclosed)

#### 1.4.11

* [fabric8](http://fabric8.io/) plugin has a nice funky 'App Store' style Profiles tab for selecting profiles
* ActiveMQ plugin can now edit and resend messages
* Minimised the generated JS to reduce the size
* Fixes [these 14 issues and enhancements](https://github.com/hawtio/hawtio/issues?milestone=15&state=closed)
* Support for Java 1.6 is deprecated

#### 1.4.4

* The Chrome Extension build worked, so we've a shiny new Chrome Extension!
* Various fixes for the new [fabric8](http://fabric8.io/) release
* Fixes [these 14 issues and enhancements](https://github.com/hawtio/hawtio/issues?milestone=14&state=closed)

#### 1.4.2

* New pane used for JMX/Camel/ActiveMQ tabs that allows resizing or hiding the JMX tree
* New terminal theme
* Restyled container list page in Fabric8 runtime view
* Switch from ng-grid to hawtio-simple-table for JMX attributes view
* Fixes [these 84 issues and enhancements](https://github.com/hawtio/hawtio/issues?milestone=13&state=closed)

#### 1.4.1

* Using new hawtio logo
* Quick bugfix release

#### 1.4.0

* Theme support with two available themes, Default and Dark
* Better pluggable branding support
* Refactored preferences page into a slide out preferences panel, made preference tabs pluggable
* Relocated perspective switcher and incorporated it into the main navigation bar
* Perspective switcher now also maintains a list of 5 recently used connections automatically
* Added [fabric8](http://fabric8.io/) branding plugin
* Fixed some minor bugs and issues in the fabric plugin.
* Upgraded to [Jolokia](http://jolokia.org/) 1.2.1
* Fixes [these 18 issues and enhancements](https://github.com/hawtio/hawtio/issues?milestone=11&state=closed)

#### 1.3.1

* Quick bugfix release
* Fixes [these 13 issues and enhancements](https://github.com/hawtio/hawtio/issues?milestone=5&page=1&state=closed)

#### 1.3.0

* [Hawtio Directives](http://hawt.io/directives/index.html) is now released as a separate JS file so its easy to consume in other angularjs based projects.
* Separate [IRC plugin example](https://github.com/hawtio/hawtio/tree/master/hawtio-plugin-examples/irc-client-plugin) to show how to develop external plugins for hawtio
* Upgraded to [Jolokia](http://jolokia.org/) 1.2 so that hawtio can discover other Jolokia processes via multicast
* ActiveMQ plugin now defaults to [showing all the real time attributes for queues](https://github.com/hawtio/hawtio/issues/1175) to avoid folks having to find the Queues folder.
* Updated to support the new package name of [fabric8 mbeans](http://fabric8.io/)
* Fixes [these 51 issues and enhancements](https://github.com/hawtio/hawtio/issues?milestone=10&state=closed)

#### 1.2.3

* New [hawtio Chrome Extension](http://hawt.io/getstarted/index.html) for easier connection to remote JVMs from your browser without having to run a hawtio server or connect through a web proxy
* Upgraded to TypeScript 0.9.5 which is faster
* [threads](https://github.com/hawtio/hawtio/tree/master/hawtio-web/src/main/webapp/app/threads) plugin to monitor JVM thread usage and status.
* Moved java code from hawtio-web into hawtio-system
* Clicking a line in the log plugin now shows a detail dialog with much more details.
* ActiveMQ plugin can now browse byte messages.
* Improved look and feel in the Camel route diagram.
* Breadcrumb navigation in Camel plugin to make it easier and faster to switch between CamelContext and routes in the selected view.
* Added Type Converter sub tab (requires Camel 2.13 onwards).
* Better support for older Internet Explorer browsers.
* Lots of polishing to work much better as the console for [fabric8](http://fabric8.io/)
* Fixes [these 175 issues and enhancements](https://github.com/hawtio/hawtio/issues?milestone=9&state=closed)

#### 1.2.2

* Added welcome page to aid first time users, and being able to easily dismiss the welcome page on startup.
* Added preference to configure the order/enabling of the plugins in the navigation bar, and to select a plugin as the default on startup.
* Added support for Apache Tomcat security using the conf/tomcat-users.xml file as user database.
* Added [quartz](http://hawt.io/plugins/quartz/) plugin to manage quartz schedulers.
* Allow to configure the HTTP session timeout used by hawtio. hawtio now uses the default timeout of the web container, instead of hardcoded value of 900 seconds.
* The [JMX](http://hawt.io/plugins/jmx/) plugin can now edit JMX attributes.
* the [osgi](http://hawt.io/plugins/osgi/) plugin now supports OSGi Config Admin and uses OSGi MetaType metadata for generating nicer forms (if the io.fabric8/fabric-core bundle is deployed which implements an MBean for introspecting the OSGi MetaType).
* Fixes [these 75 issues and enhancements](https://github.com/hawtio/hawtio/issues?milestone=8&state=closed)

#### 1.2.1

* New [Maven plugin](http://hawt.io/maven/) for running hawtio in your maven project; running Camel, Spring, Blueprint or tests.
* New plugins:
  * [JUnit](http://hawt.io/plugins/junit/) for viewing/running test cases
  * [API](http://hawt.io/plugins/api/) for viewing APIs from [Apache CXF](http://cxf.apache.org/) endpoints; currently only usable in a Fuse Fabric
  * [IDE](http://hawt.io/plugins/ide/) for generating links to open files in your IDE; currently IDEA the only one supported so far ;)
  * Site plugin for using hawtio to view and host your project website
* Improved the camel editor with a new properties panel on the right
* Fixes [these 51 issues and enhancements](https://github.com/hawtio/hawtio/issues?milestone=3&state=closed)

#### 1.2.0

* Connectivity
  * New _JVMs_ tab lets you connect to remote JVMs on your local machine; which if a JVM does not have jolokia installed it will install it on the fly. (Requires tools.jar in the classpath)
  * New _Connect_ tab to connect to a remote JVM running jolokia (and its now been removed from the Preferences page)
* ActiveMQ gets huge improvements in its tooling
  * we can more easily page through messages on a queue
  * move messages from one queue to another
  * delete messages
  * retry messages on a DLQ (in 5.9.x of ActiveMQ onwards)
  * purge queues
* Camel
  * Neater message tracing; letting you zoom into a message and step through the messages with video player controls
  * Can now forward messages on any browseable camel enpdoint to any other Camel endpoints
* Fabric
  * Redesigned fabric view allows quick access to versions, profiles and containers, mass-assignment/removal of profiles to containers
  * Easier management of features deployed in a profile via the "Edit Features" button.
  * Several properties now editable on container detail view such as local/public IP and hostname
* General
  * Secured embedded jolokia, performs authentication/authorization via JAAS
  * New login page
  * Redesigned help pages
* Tons more stuff we probably forgot to list here but is mentioned in [the issues](https://github.com/hawtio/hawtio/issues?milestone=4&state=closed) :)
* Fixes [these 407 issues and enhancements](https://github.com/hawtio/hawtio/issues?milestone=4&state=closed)

#### 1.1

* Added the following new plugins:
  * [forms](https://github.com/hawtio/hawtio/blob/master/hawtio-web/src/main/webapp/app/forms/doc/developer.md) a developer plugin for automatically creating tables and forms from json-schema models
  * [infinispan](http://hawt.io/plugins/infinispan/) for viewing metrics for your Infinispan caches or using the CLI to query or update them
  * [jclouds](http://hawt.io/plugins/jclouds/) to help make your cloud hawt
  * [maven](http://hawt.io/plugins/maven/) to let you search maven repositories, find versions, view source or javadoc
  * [tree](https://github.com/hawtio/hawtio/blob/master/hawtio-web/src/main/webapp/app/tree/doc/developer.md) a developer plugin to make it easier to work with trees
* Added a new real time Camel profile view and the first version of a web based wiki based camel editor along with improvements to the diagram rendering
* Added more flexible documentation system so that plugins are now self documenting for users and developers
* Fixes [these 80 issues and enhancements](https://github.com/hawtio/hawtio/issues?milestone=2&state=closed)

#### 1.0

* First main release of hawtio with [lots of hawt plugins](http://hawt.io/plugins/index.html).
* Fixes [these 74 issues and enhancements](https://github.com/hawtio/hawtio/issues?milestone=1&state=closed)
