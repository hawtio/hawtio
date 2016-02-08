# hawtio Groovy Shell plugin example

## Apache Tomcat installation

Copy the groovy-shell-plugin war file as the following name

    groovy-shell-plugin.war

to the deploy directory of Apache Tomcat os similar Java web container.

## Apache Karaf/ServiceMix/JBoss Fuse/fabric8 installation

From the CLI type:

    install -s mvn:io.hawt/groovy-shell-plugin/1.5-SNAPSHOT/war

(substitute 1.5-SNAPSHOT with the version of choice)
