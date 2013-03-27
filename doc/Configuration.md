## hawtio configuration

The following table contains the various configuration settings you can set via Java system properties or environment variables.

You can also specify these via the _context parameters_ in your **web.xml**. e.g. you can make your own WAR which depends on the hawtio-web.war like the [sample project's pom.xml](https://github.com/hawtio/hawtio/blob/master/sample/pom.xml#L17) then you can create your own custom web.xml file such as the [sample project's web.xml](https://github.com/hawtio/hawtio/blob/master/sample/src/main/webapp/WEB-INF/web.xml#L24).

e.g. add this to your web.xml

    <listener>
      <listener-class>io.hawt.git.GitContextListener</listener-class>
    </listener>

    <context-param>
      <param-name>hawtio.config.dir</param-name>
      <param-value>/tmp/hawtio</param-value>
    </context-param>

### configuration system properties and environment variables

<table class="table">
<tr>
<th>System Property</th><th>Environment Variable</th><th>Description</th>
</tr>
<tr>
<td>hawtio.config.dir</td><td>HAWTIO_CONFIG_DIR</td><td>The directory on the file system used to keep a copy of the configuration for hawtio; for all user settings, the dashboard configurations, the wiki etc. Typically you will push this configuration to some remote git server (maybe even github itself) so if not specified this directory will be a temporary created directory. However if you are only running one hawtio server then set this somewhere safe and you probably want to back this up!</td>
</tr>
<tr>
<td>hawtio.config.repo</td><td>HAWTIO_CONFIG_REPO</td><td>The URL of the remote git repository used to clone for the dashboard and wiki configuration. This defaults to <b>git@github.com:hawtio/hawtio-config.git</b> but if you forked the hawtio-config repository then you would use your own user name; e.g. <b>git@github.com:myUserName/hawtio-config.git</b></td>
</tr>
<tr>
<td>hawtio.config.cloneOnStartup</td><td>HAWTIO_CONFIG_CLONEONSTARTUP</td><td>If set to the value of <b>false</b> then there will be no attempt to clone the remote repo</td>
</tr>
<tr>
<td>hawtio.config.pollOnStartup</td><td>HAWTIO_CONFIG_POLLONSTARTUP</td><td>If set to the value of <b>false</b> then there will be no attempt to pull from the remote config repo on startup</td>
</tr>
<tr>
<td>hawtio.maven.index.dir</td><td>HAWTIO_MAVEN_INDEX_DIR</td><td>The directory where the maven indexer will use to store its cache and index files</td>
</tr>
</table>
