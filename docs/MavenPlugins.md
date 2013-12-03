# hawtio Maven Plugins
**Available as of hawtio 1.2.1**

**hawtio** offers a number of Maven Plugins, so that users can bootup Maven projects and have **hawtio** embedded in the running JVM.

## Maven Goals

**hawtio** offers the following Maven Goals, and each goal is futther documented below:

<table class="table">
  <tr>
    <th>Goal</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>run</td>
    <td>This goal runs the Maven project, by executing the configured *mainClass* (as a public static void main)</td>
  </tr>  
  <tr>
    <td>spring</td>
    <td>This goal runs the Maven project as a Spring application, by loading Spring XML configurations files from the classpath or file system.</td>
  </tr>    
  <tr>
    <td>camel</td>
    <td>This goal is an extension to the <a href="http://camel.apache.org/camel-maven-plugin.html">Apache Camel Maven Plugins</a>, allowing to run the Camel Maven project and have **hawtio** embedded. This allows users to gain visibility into the running JVM, and see what happens, such as live visualization of the Camel routes, and being able to debug and profile routes, and much more, offered by the <a href="http://hawt.io/plugins/camel/">Camel plugin</a>.</td>
  </tr>
  <tr>
    <td>camel-blueprint</td>
    <td>The same as the camel goal but needed when using OSGi Blueprint Camel applications.</td>
  </tr>         
</table>


### Common Maven Goal configuration

All of the **hawtio** Maven Plugins provides the following common options:

<table class="table">
  <tr>
    <th>Option</th>
    <th>Default</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>logClasspath</td>
    <td>false</td>
    <td>Whether to log the classpath.</td>
  </tr>  
  <tr>
    <td>logDependencies</td>
    <td>false</td>
    <td>Whether to log resolved Maven dependencies.</td>
  </tr>  
  <tr>
    <td>offline</td>
    <td>false</td>
    <td>Whether to run **hawtio** in offline mode. Some of the hawtio plugins requires online connection to the internet.</td>
  </tr>  
</table>



### run Maven Goal configuration

Currently all of the **hawtio** Maven Plugins provides the following common options:

<table class="table">
  <tr>
    <th>Option</th>
    <th>Default</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>context</td>
    <td>hawtio</td>
    <td>The context-path to use for the embedded **hawtio** web console.</td>
  </tr>  
  <tr>
    <td>port</td>
    <td>8080</td>
    <td>The port number to use for the embedded **hawtio** web console.</td>
  </tr>  
  <tr>
    <td>mainClass</td>
    <td></td>
    <td>The fully qualified name of the main class to executed to bootstrap the Maven project. This option is required, and must be a public static void main Java class.</td>
  </tr>  
  <tr>
    <td>arguments</td>
    <td></td>
    <td>Optional arguments to pass to the main class.</td>
  </tr>  
  <tr>
    <td>systemProperties</td>
    <td></td>
    <td>Optional system properties to set on the JVM.</td>
  </tr>  
</table>


### spring Maven Goal configuration

The spring goal extends the run goal and provides the following additional options:

<table class="table">
  <tr>
    <th>Option</th>
    <th>Default</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>applicationContextUri</td>
    <td>META-INF/spring/*.xml</td>
    <td>Location on class-path to look for Spring XML files. Mulutple paths can be seperated with semi colon. Only either one of applicationContextUri or fileApplicationContextUri can be in use.</td>
  </tr> 
  <tr>
    <td>fileApplicationContextUri</td>
    <td></td>
    <td>Location on file system to look for Spring XML files. Mulutple paths can be seperated with semi colon. Only either one of applicationContextUri or fileApplicationContextUri can be in use.</td>
  </tr>     
</table>


### camel Maven Goal configuration

The camel goal extends the run goal and provides the following additional options:

<table class="table">
  <tr>
    <th>Option</th>
    <th>Default</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>applicationContextUri</td>
    <td>META-INF/spring/*.xml</td>
    <td>Location on class-path to look for Spring XML files. Mulutple paths can be seperated with semi colon. Only either one of applicationContextUri or fileApplicationContextUri can be in use.</td>
  </tr> 
  <tr>
    <td>fileApplicationContextUri</td>
    <td></td>
    <td>Location on file system to look for Spring XML files. Mulutple paths can be seperated with semi colon. Only either one of applicationContextUri or fileApplicationContextUri can be in use.</td>
  </tr>     
</table>

By default the camel plugin will assume the application is a Camel spring application and use the applicationContextUri or fileApplicationContextUri to use as Spring XML files. By configurign a custom mainClass, then the Camel application is using the custom mainClass to bootstrap the Camel application, and neither applicationContextUri, nor fileApplicationContextUri are in use.

### camel-blueprint Maven Goal configuration

The camel goal extends the run goal and provides the following additional options:

<table class="table">
  <tr>
    <th>Option</th>
    <th>Default</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>applicationContext</td>
    <td>OSGI-INF/blueprint/*.xml</td>
    <td>Location on class-path to look for Blueprint XML files. Mulutple paths can be seperated with semi colon. Only either one of applicationContext or fileApplicationContext can be in use.</td>
  </tr> 
  <tr>
    <td>fileApplicationContext</td>
    <td></td>
    <td>Location on file-system to look for Blueprint XML files. Mulutple paths can be seperated with semi colon. Only either one of applicationContext or fileApplicationContext can be in use.</td>
  </tr> 
  <tr>
    <td>configAdminPid</td>
    <td></td>
    <td>To use a custom config admin persistence id. The configAdminFileName must be configured as well.</td>
  </tr> 
  <tr>
    <td>configAdminFileName</td>
    <td></td>
    <td>Location of the configuration admin configuration file</td>
  </tr>     
</table>


## Examples

TODO: some examples

### Camel Examples

TODO: some examples usign the Camel examples


