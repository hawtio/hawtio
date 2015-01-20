We love [contributions](http://hawt.io/contributing/index.html)! You may also want to know [how to hack on the hawtio code](http://hawt.io/developers/index.html)

[hawtio](http://hawt.io/) can now be built **without** having to install node.js or anything first thanks to the [frontend-maven-plugin](https://github.com/eirslett/frontend-maven-plugin). This
will install node.js & npm into a subdirectory, run `npm install` to install dependencies & run the build like normal.

## Building

After you've cloned hawtio's git repo the first thing you should do is build the whole project.  First ```cd``` into the root directory of the hawtio project and run:

    mvn clean install

This will ensure all dependencies within the hawtio repo are built and any dependencies are downloaded and in your local repo.

To run the sample web application for development, type:

    cd hawtio-web
    mvn compile
    mvn test-compile exec:java

On OS X and linux the _mvn compile_ command above is unnecessary but folks have found on windows there can be timing issues with grunt and maven that make this extra step a requirement (see [issue #203 for more details](https://github.com/hawtio/hawtio/issues/203#issuecomment-15808516))

Or if you want to just run an empty hawtio and connect in hawtio to a remote container (e.g. connect to a Fuse Fabric or something via the Connect tab) just run

    cd hawtio-web
    mvn clean jetty:run

### How to resolve building error of hawtio-web

In case you get any building error of `hawtio-web`, then it may be due permission error of your local `.npm` directory. This has been known to happen for osx users. To remedy this

    cd ~
    cd .npm
    sudo chown -R yourusernamehere *

Where `yourusernamehere` is your username. This will change the file permissions of the node files so you can build the project. After this try building the hawtio source code again.


### Trying Different Containers

The above uses Jetty but you can try running hawtio in different containers via any of the following commands. Each of them runs the hawtio-web in a different container (with an empty JVM so no beans or camel by default).

    mvn tomcat7:run
    mvn tomcat6:run
    mvn jboss-as:run
    mvn jetty:run

## Incrementally compiling TypeScript

For a more rapid development workflow its good to use incremental compiling of TypeScript and to use LiveReload (or LiveEdit) below too.

So in a **separate shell** (while keeping the above shell running!) run the following commands:

    cd hawtio-web
    mvn compile -Pwatch

This will incrementally watch all the *.ts files in the src/main/webapp/app directory and recompile them into src/main/webapp/app/app.js whenever there's a change.

## Incrementally compiling TypeScript inside IntelliJ (IDEA)

The easiest way we've figured out how to use [IDEA](http://www.jetbrains.com/idea/) and TypeScript together is to setup an External Tool to run watchTsc; then you get (relatively) fast recompile of all the TypeScript files to a single app.js file; so you can just keep hacking code in IDEA and letting LiveReload reload your web page.

* open the **Preferences** dialog
* select **External Tools**
* add a new one called **watchTsc**
* select path to **mvn** as the program and **compile -Pwatch** as the program arguments
* select **hawtio-web** as the working directory
* click on Output Filters...
* add a new Output Filter
* use this regular expression

```
$FILE_PATH$\($LINE$,$COLUMN$\)\:
```

Now when you do **Tools** -> **watchTsc** you should get a output in the Run tab. If you get a compile error when TypeScript gets recompiled you should get a nice link to the line and column of the error.

**Note** when you do this you probably want the Run window to just show the latest compile errors (which is usually the last couple of lines).

I spotted a handy tip on [this issue](http://youtrack.jetbrains.com/issue/IDEA-74931), if you move the cursor to the end of the Run window after some compiler output has been generated - pressing keys _META_ + _end_ (which on OS X is the _fn_ and the _option/splat_ and right cursor keys) then IDEA keeps scrolling to the end of the output automatically; you don't have to then keep pressing the "Scroll to end" button ;)

## Adding additional Javascript dependencies

Hawtio is (finally) adopting [bower](http://bower.io/) for managing dependencies, these are automatically pulled in when building the project.  It's now really easy to add third-party Javascript/CSS stuff to hawtio:

* cd into 'hawtio-web', and build it
* source 'setenv.sh' to add bower to your PATH (it's under node_modules) if you haven't installed it globally
* run 'bower install --save some-awesome-tool'
* run 'grunt bower wiredep' to update index.html
* commit the change to bower.json and index.html

When running in development mode be sure you've run 'grunt bower' if you see 404 errors for the bower package you've installed.  This is normally done for you when running 'mvn clean install'

## Using LiveReload

The LiveReload support allows you to edit the code and for the browser to automatically reload once things are compiled. This makes for a much more fun and RAD development environment!!

The easiest method to run with LiveReload support is to cd into the "hawtio-web" module and run the following:

mvn test-compile exec:java

The sample server runs an embedded LiveReload server that's all set up to look at src/main/webapp for file changes.  If you don't want to load all of the sample apps because you're connecting to another JVM you don't have to:

mvn test-compile exec:java -DloadApps=false


The Live Reload server implementation is provided by [livereload-jvm](https://github.com/davidB/livereload-jvm).  When using other methods run run hawtio like "mvn jetty:run" or "mvn tomcat:run" you can run [livereload-jvm](https://github.com/davidB/livereload-jvm) directly, for example from the hawtio-web directory:

    java -jar livereload-jvm-0.2.0-SNAPSHOT-onejar.jar -d src/main/webapp/ -e .*\.ts$

Install the [LiveReload](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei) plugin for Chrome and then enable it for the website (click the live reload icon on the right of the address bar).  There is also a LiveReload plugin for Firefox, you can get it straight from the [LiveReload site](http://livereload.com).


In another shell (as mentioned above in the "Incrementally compile TypeScript" section you probably want to auto-recompile all the TypeScript files into app.js in *another shell* via this command:

    cd hawtio-web
    mvn compile -Pwatch

Enable Live Reload in your browser (open [http://localhost:8282/hawtio/](http://localhost:8282/hawtio/) then click on the Live Reload icon to the right of the location bar).

Now if you change any source (HTML, CSS, TypeScript, JS library) the browser will auto reload on the fly. No more context-switching between your IDE and your browser! :)

To specify a different port to run on, just override the `jettyPort` property

    mvn test-compile exec:java -DjettyPort=8181

### Using your build & LiveReload inside other web containers

TODO - this needs updating still...

The easiest way to use other containers and still get the benefits of LiveReload is to create a symbolic link to the generated hawtio-web war in expanded form, in the deploy directory in your web server.

e.g. to use Tomcat7 in LiveReload mode try the following to create a symbolic link in the tomcat/webapps directory to the **hawtio-web/target/hawtio-web-1.3-SNAPSHOT** directory:

    cd tomcat/webapps
    ln -s ~/hawtio/hawtio-web/target/hawtio-web-1.3-SNAPSHOT hawtio

Then use [livereload-jvm](https://github.com/davidB/livereload-jvm) manually as shown above.

Now just run Tomcat as normal. You should have full LiveReload support and should not have to stop/start Tomcat or recreate the WAR etc!

### Running hawtio against Kubernetes / OpenShift

To try run a [local OpenShift V3 based on Kubernetes / Docker](http://fabric8.io/v2/getStarted.html) first

    opeshift start

Then run the following:

    export KUBERNETES_MASTER=http://localhost:8080
    mvn test-compile exec:java

You should now see the Kubernetes / OpenShift console at http://localhost:8282/

#### Using your build from inside Jetty

For jetty you need to name the symlink directory **hawtio.war** for [Jetty to recognise it](http://www.eclipse.org/jetty/documentation/current/automatic-webapp-deployment.html).

    cd jetty-distribution/webapps
    ln -s ~/hawtio/hawtio-web/target/hawtio-web-1.3-SNAPSHOT hawtio.war

Another thing is for symlinks jetty uses the real directory name rather than the symlink name for the context path.

So to open the application in Jetty open [http://localhost:8282/hawtio-web-1.3-SNAPSHOT/](http://localhost:8282/hawtio-web-1.3-SNAPSHOT/)


## Running Unit Tests

You can run the unit tests via maven:

    cd hawtio-web
    mvn test

If you are using the [LiveReload plugin for Chrome](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei) you can then hit the LiveReload icon to the right of the address bar and if you are running the watch profile, the tests are re-run every time there is a compile:

    mvn test -Pwatch

Now the unit tests are all re-run whenever you edit the source.

## Running integration Tests

You can run the Protractor integration tests via maven:

    cd hawtio-web
    mvn verify -Pitests

This will run the tests headlessly, in [Phantomjs](http://phantomjs.org/).

If you want to see the tests running, you can run them in Chrome with:

    cd hawtio-web
    mvn verify -Pitests,chrome

## How to Get Started Hacking the Code

Check out the [hawtio technologies, tools and code walkthroughs](http://hawt.io/developers/index.html)

## Trying hawtio with Fuse Fabric

As of writing hawtio depends on the latest snapshot of [Fuse Fabric](http://fuse.fusesource.org/fabric/). To try out hawtio with it try these steps:

  1. Grab the latest [Fuse Fabric source code](http://fuse.fusesource.org/source.html) and do a build in the fabric directory...

    git clone git://github.com/fusesource/fuse.git
    cd fuse
    cd fabric
    mvn -Dtest=false -DfailIfNoTests=false clean install

  2. Now create a Fuse Fabric instance

    cd fuse-fabric\target
    tar xf fuse-fabric-99-master-SNAPSHOT.tar.gz
    cd fuse-fabric-99-master-SNAPSHOT
    bin/fusefabric

  3. When the Fabric starts up run the command

    fabric:create

  to properly test things out you might want to create a new version and maybe some child containers.

### Running hawtio with Fuse Fabric in development mode

    cd hawtio-web
    mvn test-compile exec:java -Psnapshot,fabric

### Running hawtio using `jetty-maven-plugin` with authentication enabled

Running hawtio using `mvn jetty:run` will switch hawtio configuration to use system (instead of JNDI) properties. The default configuration uses
`<systemProperties>/<systemProperty>` list inside `jetty-maven-plugin` configuration.

One of those properties is standard JAAS property `java.security.auth.login.config` pointing at Jetty-Plus JAAS LoginModule which uses `src/test/resources/users.properties` file for mapping
users to password and roles.

By default this mapping is:

    admin=admin,admin,viewer

However `hawtio.authenticationEnabled` is disabled (`false`) by default. So in order to run hawtio using Jetty Maven plugin with authentication enabled, you can either
change this property in `hawtio-web/pom.xml`, or simply run:

    mvn jetty:run -Dhawtio.authenticationEnabled=true