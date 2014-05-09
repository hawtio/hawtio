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
      log.debug("Returning icon for: ", thing);
      return this.icons[thing];
    }

  }

  // Common icons that functions could return directly
  export var javaIcon:Icon = {
    title: "Java",
    type: "img",
    src: "app/fabric/img/java.svg"
  };

  // Service Icon Registry, maps icons to JMX domains
  export var serviceIconRegistry = new IconRegistry();

  serviceIconRegistry.addIcons({
    title: "Fabric8",
    type: "img",
    src: "app/fabric/img/fabric.png"
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
    src: "app/fabric/img/message_broker.png"
  }, "org.apache.activemq");

  serviceIconRegistry.addIcons({
    title: "Apache Camel",
    type: "img",
    src: "app/fabric/img/camel.png"
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
    src: "app/fabric/img/jetty.svg"
  }, "org.eclipse.jetty.server");

  serviceIconRegistry.addIcons({
    title: "Apache Tomcat",
    type: "img",
    src: "app/fabric/img/tomcat.svg"
  }, "Catalina", "Tomcat");


  // Container Icon Registry, maps icons to container types
  export var containerIconRegistry = new IconRegistry();

  containerIconRegistry.addIcons({
    title: "Apache Karaf",
    type: "icon",
    src: "icon-beaker"
  }, "karaf");

  // TODO - placeholder for Java containers
  containerIconRegistry.addIcons(javaIcon, "java");


}
