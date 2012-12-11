The war can now be built with the usual "mvn clean install".

Build into exploded war and watch for changed files:

mvn clean compile war:exploded bundle:manifest package -Pwatch


Deploy exploded war into karaf:

osgi:install -s jardir:/path/to/hawtio-web/target/hawtio-web-1.0-SNAPSHOT

path can be relative.  Once it's deployed you should see it in web:list.  You can use osgi:update to refresh the bundle.

TODO - have to take out the hard-coded path in grunt.js to the output directory so it's picked up from the build.
