hawtio-dev is a simple servlet that runs in karaf but looks at the filesystem
for resources, allowing you to edit the site without re-deploying into karaf
all the time.  It also avoids installing it's own jolokia unlike hawtio-web but
instead uses a proxy to proxy requests from the webapp to the already installed
jolokia instance.

There's two important settings:

# path to the static resources that the servlet should serve out
content_directory=../../../../../hawtio/hawtio-web/target/hawtio-web-1.0-SNAPSHOT

# path on the server to jolokia, the proxy will proxy requests sent to /hawtio/jolokia
# to this context
proxy_path=/jolokia


* To have the servlet pick up changes to the war edit hawt.io.web.cfg appropriately
and then:

cp hawt.io.web.cfg /path/to/karaf/etc/dir

Current contents of the .cfg file assume you've checked out the "fuse" github project and
have it in the same root directory as the hawtio source tree, and you're copying the cfg file
to the "etc" directory of an untar'd fuse-fabric distro under fabric/fuse-fabric/target.


* You can also configure this via fabric/FMC.  Create a fabric, and then create a "hawtio"
profile that's a child of "default".  In that profile add a new bundle:

mvn:io.hawt/hawtio-dev/1.0-SNAPSHOT

Then create a new Configuration:

hawt.io.web.properties

and in there add your settings.  Then add the "hawtio" profile to your current container.


* It's also worth confirming via the logging that static files are being served out:

log:set WARN
log:set DEBUG io.hawt.web.dev


There's still an issue with escaping some of the crazy Camel mbean names, so some items
under the camel tree aren't proxied correctly.
