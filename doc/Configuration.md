## hawtio configuration

The following table contains the various configuration settings you can set via Java system properties or environment variables.

#### web application configuration

If you are using a web container, the easiest way to change these configuration values is 

* Create your own WAR which depends on the **hawtio-default.war** like the [sample project's pom.xml](https://github.com/hawtio/hawtio/blob/master/sample/pom.xml#L17) 
* Create your own [blueprint.properties](https://github.com/hawtio/hawtio/blob/master/sample/src/main/resources/blueprint.properties#L7) file that then can override whatever properties you require

#### OSGi configuration

Just update the blueprint configuration values in OSGi config admim as you would any OSGi blueprint bundles. On OSGi all the hawtio Java modules use OSGi blueprint.

### configuration system properties and environment variables

<table class="table">
<tr>
<th>System Property</th><th>Description</th>
</tr>
<tr>
<td>hawtio.config.dir</td><td>The directory on the file system used to keep a copy of the configuration for hawtio; for all user settings, the dashboard configurations, the wiki etc. Typically you will push this configuration to some remote git server (maybe even github itself) so if not specified this directory will be a temporary created directory. However if you are only running one hawtio server then set this somewhere safe and you probably want to back this up!</td>
</tr>
<tr>
<td>hawtio.config.repo</td><td>The URL of the remote git repository used to clone for the dashboard and wiki configuration. This defaults to <b>git@github.com:hawtio/hawtio-config.git</b> but if you forked the hawtio-config repository then you would use your own user name; e.g. <b>git@github.com:myUserName/hawtio-config.git</b></td>
</tr>
<tr>
<td>hawtio.config.cloneOnStartup</td><td>If set to the value of <b>false</b> then there will be no attempt to clone the remote repo</td>
</tr>
<tr>
<td>hawtio.config.pullOnStartup</td><td>If set to the value of <b>false</b> then there will be no attempt to pull from the remote config repo on startup</td>
</tr>
<tr>
<td>hawtio.maven.index.dir</td><td>The directory where the maven indexer will use to store its cache and index files</td>
</tr>
</table>
