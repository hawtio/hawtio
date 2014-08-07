/**
 * @module Osgi
 */
/// <reference path="./osgiPlugin.ts"/>
module Osgi {
  export var configuration = {

    // extra metadata per config admin PID
    pidMetadata: {
      "io.fabric8.container.process.overlay.resources": {
        name: "Container Overlay Resources",
        description: "The resources overlaid over the distribution of the process"
      },
      "io.fabric8.environment": {
        name: "Environment Variables",
        description: "The operating system Environment Variables which are exported into any child processes",
        schemaExtensions: {
          disableHumanizeLabel: true
        }
      },
      "io.fabric8.mq.fabric.server": {
        name: "ActiveMQ Fabric8 Server",
        description: "The configuration of the Apache ActiveMQ server configured via the fabric"
      },
      "io.fabric8.ports": {
        name: "Ports",
        description: "The network ports exported by the container",
        schemaExtensions: {
          disableHumanizeLabel: true
        }
      },
      "io.fabric8.system": {
        name: "System Properties",
        description: "The Java System Properties which are exported into any child Java processes",
        schemaExtensions: {
          disableHumanizeLabel: true
        }
      },
      "org.ops4j.pax.logging": {
        name: "Logging",
        description: "The configuration of the logging subsystem"
      }
    },

    // pids to ignore from the config UI
    ignorePids: [
      "jmx.acl",
      "io.fabric8.agent",
      "io.fabric8.mq.fabric.template",
      "org.apache.karaf.command.acl.",
      "org.apache.karaf.service.acl."
    ],

    // UI tabs
    tabs: {
      "fabric8": {
        label: "Fabric8",
        description: "Configuration options for the Fabric8 services",
        pids: ["io.fabric8"]
      },
      "karaf": {
        label: "Karaf",
        description: "Configuration options for the Apache Karaf container and subsystem",
        pids: ["org.apache.karaf"]
      }
    }
  };
}