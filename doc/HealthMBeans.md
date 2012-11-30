# Health MBeans

Its very handy to add health checks to Java code running in a JVM and exposing those health checks over JMX. e.g. see the [dropwizard notes](http://dropwizard.codahale.com/getting-started/#creating-a-health-check).

This document outlines a Health check MBean convention that if folks adopt its then easier to discover and will be included in the Console's Health tab.

## Health MBean Convention

Create at least one MBean and register it with a JMX ObjectName including **Type=Health**.

For example an ObjectName could be

    org.apache.activemq:BrokerName=localhost,Type=Health

The MBean should then have these methods

* health() which returns a JMX compliant data structure such as tabular or composite data
* heathList() which returns a List&lt;Object&gt; or array of objects for use by tools like Jolokia that marshall objects nicely to JSON to avoid JMX's marshalling pain.

Each health status object should include the following properties if possible...

* code = the unique code of the kind of warning/error/issue. We can then use this unique kind ID to generate useful UI tooling & descriptions. Ideally the code should be fully qualified in the same way as Java classes, such as org.apache.activemq.destination.NoConsumer
* resource = the JMX ObjectName of the thing causing the issue. If its hard to do, just include plenty of other properties to describe the resource/component that caused the issue
* severity = the severity level such as INFO, WARN, ERROR, CRITICAL to give some indication of how serious the problem is
