module Fabric {

  export interface Icon {
    title: string;
    type: string;
    src: string;
  };

  export class IconRegistry {
    private icons = {};

    public addIcons(icon:Icon, domain:string, ... domains:string[]) {
      this.addIcon(icon, domain);
      if (domains && angular.isArray(domains)) {
        domains.forEach((domain) => {
          this.addIcon(icon, domain);
        });
      }
    }

    private addIcon(icon:Icon, domain) {
      this.icons[domain] = icon;
    }

    public getIcons(things:string[]) {
      var answer = [];
      if (things && angular.isArray(things)) {
        things.forEach((thing) => {
          if (this.icons[thing]) {
            answer.push(this.icons[thing]);
          }
        });
      }
      return answer.unique();
    }

    public getIcon(thing:string) {
      return this.icons[thing];
    }

  }

  // Common icons that functions could return directly
  export var javaIcon:Icon = {
    title: "Java",
    type: "img",
    src: "img/icons/java.svg"
  };

  // Service Icon Registry, maps icons to JMX domains
  export var serviceIconRegistry = new IconRegistry();

  serviceIconRegistry.addIcons({
    title: "Kubernetes",
    type: "img",
    src: "img/icons/kubernetes.svg"
  }, "io.kubernetes");

  serviceIconRegistry.addIcons({
    title: "Fabric8",
    type: "img",
    src: "img/icons/fabric8_icon.svg"
  }, "io.fabric8", "org.fusesource.fabric");

  serviceIconRegistry.addIcons({
    title: "Fabric8 Insight",
    type: "icon",
    src: "icon-eye-open"
  }, "org.fusesource.insight", "io.fabric8.insight");

  serviceIconRegistry.addIcons({
    title: "hawtio",
    type: "img",
    src: "img/hawtio_icon.svg"
  }, "hawtio");

  serviceIconRegistry.addIcons({
    title: "Apache ActiveMQ",
    type: "img",
    src: "img/icons/messagebroker.svg"
  }, "org.apache.activemq");

  serviceIconRegistry.addIcons({
    title: "Apache Camel",
    type: "img",
    src: "img/icons/camel.svg"
  }, "org.apache.camel");

  serviceIconRegistry.addIcons({
    title: "Apache CXF",
    type: "icon",
    src: "icon-puzzle-piece"
  }, "org.apache.cxf");

  serviceIconRegistry.addIcons({
    title: "Apache Karaf",
    type: "icon",
    src: "icon-beaker"
  }, "org.apache.karaf");

  serviceIconRegistry.addIcons({
    title: "Apache Zookeeper",
    type: "icon",
    src: "icon-group"
  }, "org.apache.zookeeper");

  serviceIconRegistry.addIcons({
    title: "Jetty",
    type: "img",
    src: "img/icons/jetty.svg"
  }, "org.eclipse.jetty.server");

  serviceIconRegistry.addIcons({
    title: "Apache Tomcat",
    type: "img",
    src: "img/icons/tomcat.svg"
  }, "Catalina", "Tomcat");

  serviceIconRegistry.addIcons({
    title: "WildFly",
    type: "img",
    src: "img/icons/wildfly.svg"
  }, "jboss", "wildfly");

  serviceIconRegistry.addIcons({
    title: "Apache Cassandra",
    type: "img",
    src: "img/icons/cassandra.svg",
    "class": "girthy"
  }, "org.apache.cassandra.db", "org.apache.cassandra.metrics", "org.apache.cassandra.net", "org.apache.cassandra.request");


  // Container Icon Registry, maps icons to container types
  export var containerIconRegistry = new IconRegistry();

  containerIconRegistry.addIcons({
    title: "Apache Karaf",
    type: "icon",
    src: "icon-beaker"
  }, "karaf");

  containerIconRegistry.addIcons({
    title: "Apache Cassandra",
    type: "img",
    src: "img/icons/cassandra.svg",
    "class": "girthy"
  }, "Cassandra");

  containerIconRegistry.addIcons({
    title: "Apache Tomcat",
    type: "img",
    src: "img/icons/tomcat.svg"
  }, "Tomcat");

  // TODO could use a TomEE specific icon really
  containerIconRegistry.addIcons({
    title: "Apache TomEE",
    type: "img",
    src: "img/icons/tomcat.svg"
  }, "TomEE");

  containerIconRegistry.addIcons({
    title: "Jetty",
    type: "img",
    src: "img/icons/jetty.svg"
  }, "Jetty");

  containerIconRegistry.addIcons({
    title: "Kubernetes",
    type: "img",
    src: "img/icons/kubernetes.svg"
  }, "kubelet");

  containerIconRegistry.addIcons({
    title: "WildFly",
    type: "img",
    src: "img/icons/wildfly.svg"
  }, "WildFly");

  // TODO - placeholder for Java containers
  containerIconRegistry.addIcons(javaIcon, "java");


}
