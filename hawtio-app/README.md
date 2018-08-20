# Hawtio executable JAR

You can run hawtio on your machine using the hawtio-app executable JAR.

Once you have built it, just run this from the command line:

    java -jar hawtio-app-x.y.z.jar

Note: If you launch Hawtio with Java 9, add the specified modules to avoid errors on startup and allow attaching to other Java processes:

    java --add-modules jdk.attach,java.xml.bind -jar hawtio-app-x.y.z.jar

The console should show you which URL to open, which by default is [http://localhost:8080/hawtio/](http://localhost:8080/hawtio/).

To set a different port number, run:

    java -jar hawtio-app-x.y.z.jar --port 8090

To see the full list of configuration options, run:

    java -jar hawtio-app-x.y.z.jar --help
