## Environment Variables

Using [Docker](http://docker.io/) containers is increasingly common. We now have a [docker container for running hawtio](https://github.com/fabric8io/hawtio-docker) for example.

When using docker then environment variables are a preferred way to configure things with environmental values.

So when using **hawtio-base** or **hawtio-default** you can use environment variables to override any of the properties on this page.

To override property "hawtio.foo" just set an environment variable (using _ for dots).

    export hawtio_foo=bar

and if you boot up hawtio in that shell (or you pass that variable into a docker container) then you will override the system property _hawtio.foo_

## Configuring Security

hawtio enables security out of the box depending on the container it is running within. Basically there is two types of containers:

- Karaf based containers
- Web containers

#### Default Security Settings for Karaf containers

By default the security in hawtio uses these system properties when running in Apache Karaf containers (Karaf, ServiceMix, JBoss Fuse) which you can override:

<table class="buttonTable table table-striped">
  <thead>
  <tr>
    <th>Name</th>
    <th>Default</th>
    <th>Description</th>
  </tr>
  </thead>
  <tbody>
  <tr>
    <td>
      hawtio.authenticationEnabled
    </td>
    <td>
      true
    </td>
    <td>
      Whether or not security is enabled
    </td>
  </tr>
  <tr>
    <td>
      hawtio.realm
    </td>
    <td>
      karaf
    </td>
    <td>
      The security realm used to login
    </td>
  </tr>
  <tr>
    <td>
      hawtio.role or hawtio.roles
    </td>
    <td>
      admin,viewer
    </td>
    <td>
      The user role or roles required to be able to login to the console. Multiple roles to allow can be separated by a comma.  Set to * or an empty value to disable role checking when hawtio authenticates a user.
    </td>
  </tr>
  <tr>
    <td>
      hawtio.rolePrincipalClasses
    </td>
    <td>      
    </td>
    <td>
      Principal fully qualified classname(s). Multiple classes can be separated by a comma.  Leave unset or set to an empty value to disable role checking when hawtio authenticates a user.
    </td>
  </tr>
  <tr>
    <td>
      hawtio.noCredentials401
    </td>
    <td>
      false
    </td>
    <td>
      Whether to return HTTP status 401 when authentication is enabled, but no credentials has been provided. Returning 401 will cause the browser popup window to prompt for credentails. By default this option is false, returning HTTP status 403 instead.
    </td>
  </tr>
  <tr>
    <td>
      hawtio.authenticationContainerDiscoveryClasses
    </td>
    <td>
      io.hawt.web.tomcat.TomcatAuthenticationContainerDiscovery
    </td>
    <td>
        List of used AuthenticationContainerDiscovery implementations separated by comma. By default there is just TomcatAuthenticationContainerDiscovery, which is used to authenticate users on Tomcat from tomcat-users.xml file. Feel free to remove it if you want to authenticate users on Tomcat from configured jaas login module or feel free to add more classes of your own.
    </td>
  </tr>    
  </tbody>
</table>

Changing these values is often application server specific. Usually the easiest way to get hawtio working in your container is to just ensure you have a new user with the required role (by default its the 'admin' role).


##### Example: customize the allowed roles in Fabric8

Hawtio reads its values in form of system properties. To define them in Fabric8:

    dev:system-property hawtio.roles my_organization_admin
    # restart hawtio bundle
    restart io.hawt.hawtio-web

Now only users with the `my_organization_admin` role will be allowed to login in Hawtio.

To add the `my_organization_admin` role to the `admin` user in Fabric8:

    jaas:manage --realm karaf
    jaas:roleadd admin my_organization_admin
    jaas:update



#### Default Security Settings for web containers

By default the security in hawtio uses these system properties when running in any other container which you can override:

<table class="buttonTable table table-striped">
  <thead>
  <tr>
    <th>Name</th>
    <th>Default</th>
    <th>Description</th>
  </tr>
  </thead>
  <tbody>
  <tr>
    <td>
      hawtio.authenticationEnabled
    </td>
    <td>
      false
    </td>
    <td>
      Whether or not security is enabled
    </td>
  </tr>
  <tr>
    <td>
      hawtio.realm
    </td>
    <td>
      *
    </td>
    <td>
      The security realm used to login
    </td>
  </tr>
  <tr>
    <td>
      hawtio.role or hawtio.roles
    </td>
    <td>
    </td>
    <td>
       The user role or roles required to be able to login to the console. Multiple roles to allow can be separated by a comma.  Set to * or an empty value to disable role checking when hawtio authenticates a user.
    </td>
  </tr>
  <tr>
    <td>
      hawtio.rolePrincipalClasses
    </td>
    <td>
    </td>
    <td>
      Principal fully qualified classname(s). Multiple classes can be separated by comma.
    </td>
  </tr>
  <tr>
    <td>
      hawtio.noCredentials401
    </td>
    <td>
    </td>
    <td>
       Whether to return HTTP status 401 when authentication is enabled, but no credentials has been provided. Returning 401 will cause the browser popup window to prompt for credentails. By default this option is false, returning HTTP status 403 instead.
    </td>
  </tr>
  <tr>
    <td>
      hawtio.authenticationContainerDiscoveryClasses
    </td>
    <td>
      io.hawt.web.tomcat.TomcatAuthenticationContainerDiscovery
    </td>
    <td>
        List of used AuthenticationContainerDiscovery implementations separated by comma. By default there is just TomcatAuthenticationContainerDiscovery, which is used to authenticate users on Tomcat from tomcat-users.xml file. Feel free to remove it if you want to authenticate users on Tomcat from configured jaas login module or feel free to add more classes of your own.
    </td>
  </tr>  
  </tbody>
</table>



#### Configuring or disabling security in web containers

Set the following JVM system property to enable security:

    hawtio.authenticationEnabled=true

Or adjust the web.xml file and configure the &lt;env-entry&gt; element, accordingly.

##### Configuring security in Apache Tomcat

From **hawt 1.2.2** onwards we made it much easier to use Apache Tomcats userdata file (conf/tomcat-users.xml) for security.
All you have to do is to set the following **CATALINA_OPTS** environment variable:

    export CATALINA_OPTS=-Dhawtio.authenticationEnabled=true

Then **hawtio** will auto detect that its running in Apache Tomcat, and use its userdata file (conf/tomcat-users.xml) for security.

For example to setup a new user named scott with password tiger, then edit the file '''conf/tomcat-users.xml''' to include:

    <user username="scott" password="tiger" roles="tomcat"/>

Then you can login to hawtio with the username scott and password tiger.

If you only want users of a special role to be able to login **hawtio** then you can set the role name in the **CATALINA_OPTS** environment variable as shown:

    export CATALINA_OPTS='-Dhawtio.authenticationEnabled=true -Dhawtio.role=manager'

Now the user must be in the manager role to be able to login, which we can setup in the '''conf/tomcat-users.xml''' file:

    <role rolename="manager"/>
    <user username="scott" password="tiger" roles="tomcat,manager"/>

Note that if you still want to use your own login modules instead of conf/tomcat-users.xml file, you can do it by remove TomcatAuthenticationContainerDiscovery from     
system properties and point to login.conf file with your login modules configuration. Something like:

    export CATALINA_OPTS='-Dhawtio.authenticationEnabled=true -Dhawtio.authenticationContainerDiscoveryClasses= -Dhawtio.realm=hawtio -Djava.security.auth.login.config=$CATALINA_BASE/conf/login.conf'

Then you can configure jaas in file TOMCAT_HOME/conf/login.conf (Example of file below in jetty section).     

##### Configuring security in Jetty



To use security in jetty you first have to setup some users with roles. To do that navigate to the etc folder of your jetty installation and create the following file etc/login.properties and enter something like this:

    scott=tiger, user
    admin=CRYPT:adpexzg3FUZAk,admin,user

You have added two users. The first one named scott with the password tiger. He has the role user assigned to it. The second user admin with password admin which is obfuscated (see jetty realms for possible encryption methods). This one has the admin and user role assigned.

Now create a second file in the same directory called login.conf. This is the login configuration file.

    hawtio {
      org.eclipse.jetty.jaas.spi.PropertyFileLoginModule required 
      debug="true"
      file="${jetty.base}/etc/login.properties";
    };

Next you have to change the hawtio configuration:
    
<table class="buttonTable table table-striped">
  <thead>
  <tr>
    <th>Name</th>
    <th>Default</th>
    <th>Description</th>
  </tr>
  </thead>
  <tbody>
  <tr>
    <td>
      hawtio.authenticationEnabled
    </td>
    <td>
      true
    </td>
    <td>
      Whether or not security is enabled
    </td>
  </tr>
  <tr>
    <td>
      hawtio.realm
    </td>
    <td>
      hawtio
    </td>
    <td>
      The security realm used to login
    </td>
  </tr>
  <tr>
    <td>
      hawtio.role
    </td>
    <td>
    admin
    </td>
    <td>
      The user role required to be able to login to the console
    </td>
  </tr>
  <tr>
    <td>
      hawtio.rolePrincipalClasses
    </td>
    <td>
    </td>
    <td>
      Principal fully qualified classname(s). Multiple classes can be separated by comma.
    </td>
  </tr>
  </tbody>
</table>

You have now enabled security for hawtio. Only users with role "admin" are allowed.

At last enable the jaas module in jetty. This is done by adding the following line to the start.ini which is located in the jetty.base folder:

    # Enable security via jaas, and configure it
    --module=jaas

## Configuration Properties

The following table contains the various configuration settings for the various hawtio plugins.

<table class="table table-striped">
  <thead>
    <tr>
      <th>System Property</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>hawtio.offline</td>
      <td>Whether to run hawtio in offline mode (default false). When in offline mode, then some plugins is not enabled such as <a href="http://hawt.io/plugins/maven/">Maven</a> and <a href="http://hawt.io/plugins/git/">Git</a>.</td>
    </tr>
    <tr> 
      <td>hawtio.dirname</td>
      <td>The directory name for the hawtio home. Is by default <tt>/.hawtio</tt>. This complete home directory for hawtio is the <tt>hawtio.config.dir</tt><tt>hawtio.dirname</tt>, so remember to have leading / in this option. The out of the box options translates as the: <tt>user.home/.hawtio</tt> directory.</td>
    </tr>
    <tr> 
      <td>hawtio.config.dir</td>
      <td>The directory on the file system used to keep a copy of the configuration for hawtio; for all user settings, the dashboard configurations, the wiki etc. Typically you will push this configuration to some remote git server (maybe even github itself) so if not specified this directory will be a temporary created directory. However if you are only running one hawtio server then set this somewhere safe and you probably want to back this up!. See also the hawtio.dirname option.</td>
    </tr>
    <tr>
      <td>hawtio.config.repo</td>
      <td>The URL of the remote git repository used to clone for the dashboard and wiki configuration. This defaults to <b>git@github.com:hawtio/hawtio-config.git</b> but if you forked the hawtio-config repository then you would use your own user name; e.g. <b>git@github.com:myUserName/hawtio-config.git</b></td>
    </tr>
    <tr>
      <td>hawtio.config.cloneOnStartup</td>
      <td>If set to the value of <b>false</b> then there will be no attempt to clone the remote repo</td>
    </tr>
    <tr>
      <td>hawtio.config.importURLs</td>
      <td>The URLs (comman separated) of jar/zip contents that should be downloaded and imported into the wiki on startup. This supports the <code>mvn:group/artifact/version[/extension/classifier]</code> syntax so you can refer to jars/zips from maven repos</td>
    </tr>
    <tr>
      <td>hawtio.config.pullOnStartup</td>
      <td>If set to the value of <b>false</b> then there will be no attempt to pull from the remote config repo on startup</td>
    </tr>
    <tr>
      <td>hawtio.maven.index.dir</td>
      <td>The directory where the maven indexer will use to store its cache and index files</td>
    </tr>
    <tr>
      <td>hawtio.sessionTimeout</td>
      <td><strong>hawtio 1.2.2</strong> The maximum time interval, in seconds, that the servlet container will keep this session open between client accesses. If this option is not configured, then hawtio uses the default session timeout of the servlet container.</td>
    </tr>
  </tbody>
</table>

## Web Application configuration

If you are using a web container, the easiest way to change the web app configuration values is:

* Create your own WAR which depends on the **hawtio-default.war** like the [sample project's pom.xml](https://github.com/hawtio/hawtio/blob/master/sample/pom.xml#L17)
* Create your own [blueprint.properties](https://github.com/hawtio/hawtio/blob/master/sample/src/main/resources/blueprint.properties#L7) file that then can override whatever properties you require

#### OSGi configuration

Just update the blueprint configuration values in OSGi config admim as you would any OSGi blueprint bundles. On OSGi all the hawtio Java modules use OSGi blueprint.


#### More information

In the [articles](http://hawt.io/articles/index.html) colleciton you may find links to blog posts how to setup authentication with hawtio in various other containers. 
