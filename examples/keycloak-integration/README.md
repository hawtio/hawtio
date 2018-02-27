hawtio integration with Keycloak
================================

Those steps assume that you want your hawtio console to be secured by [Keycloak](http://www.keycloak.org). Integration consists of 2 main steps. First step is to download and prepare Keycloak server. Next step is deploy hawtio to your favourite server (JBoss Fuse, Karaf, Jetty, Tomcat, ...) and configure it to use Keycloak for authentication.

Prepare Keycloak server
-----------------------

1. Download keycloak server from http://www.keycloak.org and download version 3.4.1.Final.
Then unpack and run keycloak server on `localhost:8080`.

2. If you haven't created `demo` realm on Keycloak yet, see Keycloak [Getting Started](http://www.keycloak.org/docs/3.4/getting_started/index.html#creating-a-realm-and-user) guide to create one.

3. Download [demorealm.json](https://github.com/keycloak/keycloak/blob/3.4.1.Final/examples/fuse/demorealm.json) with Keycloak sample metadata about `demo` realm. It's assumed you downloaded it to directory `/downloads` on your laptop.

4. Import the downloaded `demorealm.json` file into your Keycloak. Import can be done either via Keycloak admin console or by using `keycloak.import` system property:
    
        unzip -q /downloads/keycloak-3.4.1.Final.zip
        cd keycloak-3.4.1.Final/bin/
        ./standalone.sh -Djboss.http.port=8080 -Dkeycloak.import=/downloads/demorealm.json

Realm has `hawtio-client` application installed as public client. There are a couple of realm roles like `admin` and `viewer`. Names of these roles are same like default hawtio roles, which are allowed to login into hawtio admin console and to JMX.

There are also 3 users:

* **root** with password `password` and role `jmxAdmin`, so he is allowed to login into hawtio
* **john** with password `password` and role `viewer`, so he is allowed to login into hawtio
* **mary** with password `password` and no role assigned, so she is not allowed to login into hawtio


Apache Karaf or JBoss Fuse
--------------------------

Assuming `$KARAF_HOME` is the root directory of your Karaf/Fuse installation.

* Add this into the end of file `$KARAF_HOME/etc/system.properties`:
    
        hawtio.keycloakEnabled=true
        hawtio.realm=keycloak
        hawtio.keycloakClientConfig=${karaf.base}/etc/keycloak-hawtio-client.json
        hawtio.rolePrincipalClasses=org.keycloak.adapters.jaas.RolePrincipal,org.apache.karaf.jaas.boot.principal.RolePrincipal

* Download and copy [keycloak-hawtio.json](keycloak-hawtio.json) and [keycloak-hawtio-client.json](keycloak-hawtio-client.json) into Karaf/Fuse.
File `keycloak-hawtio.json` is currently used for adapters on server (JAAS Login module) side. File `keycloak-hawtio-client.json` is used on client (hawtio JS application) side.
    
        cp /downloads/keycloak-hawtio.json $KARAF_HOME/etc/
        cp /downloads/keycloak-hawtio-client.json $KARAF_HOME/etc/

* Run Karaf/Fuse.
    
        cd $KARAF_HOME/bin
        ./karaf
    
    Replace `./karaf` with `./fuse` if you are on JBoss Fuse.

* Install hawtio.
    
        feature:add-repo hawtio 2.0-beta-1
        feature:install hawtio

* Install keycloak OSGi bundling into Karaf/Fuse . It contains a few jars with Keycloak adapter and also configuration of `keycloak` JAAS realm
    
        feature:repo-add mvn:org.keycloak/keycloak-osgi-features/3.4.1.Final/xml/features
        feature:install keycloak
    
    You might also need to install the Keycloak Jetty 9 feature.

        feature:install keycloak-jetty9-adapter

* Go to [http://localhost:8181/hawtio](http://localhost:8181/hawtio) and login in keycloak as `root` or `john` to see hawtio admin console. If you login as `mary`, you should receive 'forbidden' error in hawtio.


WildFly or JBoss EAP
--------------------

This is even easier as you can use same WildFly server where Keycloak is already running. No need to have separate server, but you can use separate server if you want.

So in next steps we will use the existing Keycloak server on localhost:8080 and assume that hawtio WAR is already deployed on WildFly as described in http://hawt.io/getstarted/index.html.

* Download and copy [keycloak-hawtio.json](keycloak-hawtio.json) and [keycloak-hawtio-client.json](keycloak-hawtio-client.json) into WildFly.
  File `keycloak-hawtio.json` is currently used for adapters on server (JAAS Login module) side. File `keycloak-hawtio-client.json` is used on client (hawtio JS application) side.
    
        cp /downloads/keycloak-hawtio.json $JBOSS_HOME/standalone/configuration/
        cp /downloads/keycloak-hawtio-client.json $JBOSS_HOME/standalone/configuration/

* In `$JBOSS_HOME/standalone/configuration/standalone.xml` configure system properties like this:
    
        <extensions>
            ...
        </extensions>

        <system-properties>
            <property name="hawtio.authenticationEnabled" value="true" />
            <property name="hawtio.realm" value="hawtio" />
            <property name="hawtio.roles" value="admin,manager,viewer" />
            <property name="hawtio.rolePrincipalClasses" value="org.keycloak.adapters.jaas.RolePrincipal" />
            <property name="hawtio.keycloakEnabled" value="true" />
            <property name="hawtio.keycloakClientConfig" value="${jboss.server.config.dir}/keycloak-hawtio-client.json" />
            <property name="hawtio.keycloakServerConfig" value="${jboss.server.config.dir}/keycloak-hawtio.json" />
        </system-properties>
    
    Also add hawtio realm to this file to `security-domains` section:
    
        <security-domain name="hawtio" cache-type="default">
            <authentication>
                <login-module code="org.keycloak.adapters.jaas.BearerTokenLoginModule" flag="required">
                    <module-option name="keycloak-config-file" value="${hawtio.keycloakServerConfig}"/>
                </login-module>
            </authentication>
        </security-domain>

* Install Keycloak adapter subsystem to your WildFly as described in [Keycloak documentation](http://www.keycloak.org) .

* Add the `secure-deployment` section hawtio into `$JBOSS_HOME/standalone/configuration/standalone.xml`  to the keycloak subsystem. It should ensure that hawtio WAR is able to find the JAAS login modules.
    
        <subsystem xmlns="urn:jboss:domain:keycloak:1.1">
            <secure-deployment name="hawtio.war">
                <resource>does-not-matter</resource>
                <auth-server-url>does-not-matter</auth-server-url>
            </secure-deployment>
        </subsystem>

* Run WildFly on port 8080 as described in [Prepare Keycloak server](#prepare-keycloak-server) section and go to http://localhost:8080/hawtio. Users are again `root` and `john` with access and `mary` without access.


Jetty
-----

Assuming `$JETTY_HOME` is the root directory of your Jetty installation and you deployed hawtio WAR to Jetty as described in [hawtio Get Started](http://hawt.io/getstarted/index.html).

* Create file `$JETTY_HOME/etc/login.conf` with the content like this:
    
        hawtio {
            org.keycloak.adapters.jaas.BearerTokenLoginModule required
                keycloak-config-file="${hawtio.keycloakServerConfig}";
        };

* Download and copy [keycloak-hawtio.json](keycloak-hawtio.json) and [keycloak-hawtio-client.json](keycloak-hawtio-client.json) into Jetty.
  File `keycloak-hawtio.json` is currently used for adapters on server (JAAS Login module) side. File `keycloak-hawtio-client.json` is used on client (hawtio JS application) side.
    
        cp /downloads/keycloak-hawtio.json $JETTY_HOME/etc/
        cp /downloads/keycloak-hawtio-client.json $JETTY_HOME/etc/

* Install Keycloak jetty adapter into your Jetty server as described on: http://www.keycloak.org/docs/3.4/securing_apps/index.html#_jetty9_adapter

* Export `JETTY_HOME` in your terminal. For example:
    
        export JETTY_HOME=/mydir/jetty-distribution-9.x.x

* Export `JAVA_OPTIONS` and add all necessary system options similarly like this:
    
        export JAVA_OPTIONS="-Dhawtio.authenticationEnabled=true \
                             -Dhawtio.realm=demo \
                             -Dhawtio.keycloakEnabled=true \
                             -Dhawtio.roles=admin,manager,viewer \
                             -Dhawtio.rolePrincipalClasses=org.keycloak.adapters.jaas.RolePrincipal \
                             -Dhawtio.keycloakClientConfig=$JETTY_HOME/etc/keycloak-hawtio-client.json \
                             -Dhawtio.keycloakServerConfig=$JETTY_HOME/etc/keycloak-hawtio.json \
                             -Djava.security.auth.login.config=$JETTY_HOME/etc/login.conf"

* Run Jetty and go to http://localhost:8080/hawtio. Users are again `root` and `john` with access and `mary` without access.


Tomcat
------

Instructions are quite similar to Jetty. You would need to setup JAAS realm and set the system properties. Just use Tomcat adapter instead of the Jetty one. Also you may need to add system property (really empty value):

    -Dhawtio.authenticationContainerDiscoveryClasses=

This is needed, so that Tomcat will use configured JAAS realm with BearerTokenLoginModule instead of `tomcat-users.xml` file, which hawtio uses on Tomcat by default.
