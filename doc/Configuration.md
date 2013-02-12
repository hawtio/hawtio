## Hawtio configuration

The following table contains the various configuration settings you can set via Java system properties or environment variables

<table>
<tr>
<th>System Property</th><th>Environment Variable</th><th>Description</th>
</tr>
<tr>
<td>hawtio.config.dir</td><td>HAWTIO_CONFIG_DIR</td><td>The directory on the file system used to keep a copy of the configuration for hawtio; for all user settings, the dashboard configurations, the wiki etc. Typically you will push this configuration to some remote git server (maybe even github itself) so if not specified this directory will be a temporary created directory. However if you are only running one hawtio server then set this somewhere safe and you probably want to back this up!</td>
</tr>
</table>