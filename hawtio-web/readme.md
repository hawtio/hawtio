* The war can now be built with:

mvn clean install

node_modules for grunt-type and grunt-contrib-copy are already available, it might be necessary to do:

npm install -g typescript

to get typescript installed first if setting up a new machine.


* Install the war into karaf/fuse-fabric/fuse-esb with:

osgi:install -s mvn:io.hawt/hawtio-web/1.0-SNAPSHOT/war

You can also run:

log:set DEBUG hawt.io

to see files served out, by default they'll come from the war file as expected.


* To then build the exploded war and watch for changed files:

mvn clean compile war:exploded bundle:manifest package -Pwatch


* To then have the servlet pick up changes to the war edit hawt.io.web.cfg appropriately
and then:

cp hawt.io.web.cfg /path/to/karaf/etc/dir

Current contents of the .cfg file assume you've checked out the "fuse" github project and
have it in the same root directory as the hawtio source tree, and you're copying the cfg file
to the "etc" directory of an untar'd fuse-fabric distro under fabric/fuse-fabric/target.



TODO - have to take out the hard-coded path in grunt.js to the output directory so it's picked up from the build.
