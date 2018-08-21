## JBoss Configuration ##

Overwrite configuration in `web.xml`

As some parts of the Hawtio configuration are defined as JNDI environment variables you need to enable property substitution in standard deployment descriptors.

The following JBoss CLI command demonstrates how to achieve this:

    /subsystem=ee:write-attribute(name=spec-descriptor-property-replacement,value=true)

Now you can overwrite the configuration defined in `web.xml` using the following system properties:

    hawtio.authenticationEnabled
    hawtio.rolePrincipalClasses
    hawtio.realm
    hawtio.dirname
    hawtio.proxyWhitelist

These can either set by using JBoss CLI, f.e.

    /system-property=hawtio.authenticationEnabled:add(value="true")

or by passing a property file during JBoss startup using the `-P property-file` option.
