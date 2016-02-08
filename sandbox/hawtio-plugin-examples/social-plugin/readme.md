# hawtio Social Twitter plugin example

## Apache Tomcat installation

Copy the social-plugin war file as the following name

    social.war

to the deploy directory of Apache Tomcat or similar Java web container.

## Apache Karaf/ServiceMix/JBoss Fuse/Fabric8 installation

From the CLI type:

    install -s mvn:io.hawt/social-plugin/1.5-SNAPSHOT/war

(substitute 1.5-SNAPSHOT with the version of your choice)
