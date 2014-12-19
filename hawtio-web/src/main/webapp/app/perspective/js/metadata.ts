/**
 * @module Perspective
 */
/// <reference path="../../insight/js/insightHelpers.ts"/>
/// <reference path="../../fabric/js/fabricHelpers.ts"/>
/// <reference path="../../site/js/siteHelpers.ts"/>
module Perspective {

  export var containerPerspectiveEnabled = true;

  /**
   * Configuration for the perspective plugin that defines what tabs are in which perspectives
   * @property metadata
   * @for Perspective
   * @type {any}
   */
  export var metadata = {
    kubernetes: {
      icon: {
        title: "Fabric8",
        type: "img",
        src: "img/icons/fabric8_icon.svg"
      },
      label: "Fabric8",
      isValid: (workspace) => !Fabric.isFMCContainer(workspace) && Kubernetes.isKubernetes(workspace),
      lastPage: "#/kubernetes/pods",
      topLevelTabs: {
        includes: [
          {
            content: "Runtime",
            id: "kubernetes"
          },
          {
            content: "Library",
            href: "#/wiki"
          },
          {
            href: "#/docker"
          },
          {
            id: "apis.index"
          },
          {
            id: "kibana"
          },
          {
            id: "grafana"
          },
          {
            href: "#/dashboard"
          },
          {
            href: "#/health"
          }
        ]
      }
    },
    fabric: {
      icon: {
        title: "Fabric8",
        type: "img",
        src: "img/icons/fabric8_icon.svg"
      },
      label: "Fabric",
      isValid: (workspace) => Fabric.isFMCContainer(workspace),
      lastPage: "#/fabric/containers",
      topLevelTabs: {
        includes: [
          {
            id: "kubernetes"
          },
          {
            id: "fabric.containers"
          },
          {
            id: "fabric.profiles"
          },
          {
            href: "#/wiki/branch/"
          },
          {
            href: "#/fabric"
          },
          {
            id: "fabric.requirements"
          },
          {
            href: "#/wiki/profile"
          },
          {
            href: "#/docker"
          },
          {
            href: "#/dashboard"
          },
          {
            href: "#/health"
          }
        ]
      }
    },
    container: {
      icon: {
        title: "Java",
        type: "img",
        src: "img/icons/java.svg"
      },
      label: "Container",
      lastPage: "#/logs",
      isValid: (workspace) => workspace && workspace.tree && workspace.tree.children && workspace.tree.children.length,
      topLevelTabs: {
        excludes: [
          {
            href: "#/fabric"
          },
          {
            href: "#/kubernetes"
          },
          {
            id: "fabric.profiles"
          },
          {
            id: "fabric.containers"
          },
          {
            id: "fabric.requirements"
          },
          {
            id: "fabric.kubernetes"
          },
          {
            href: "#/insight"
          },
          {
            href: "#/camin"
          },
          {
            id: "insight-camel"
          },
          {
            id: "dashboard",
            // we only want to include dashboard if we are running in fabric (as they are in another perspective)
            // (must use "id" attribute for the plugin, an not href, when using onCondition)
            onCondition: (workspace) => !Fabric.isFMCContainer(workspace)
          },
          {
            id: "health",
            // we only want to include health if we are running in fabric (as they are in another perspective)
            // (must use "id" attribute for the plugin, an not href, when using onCondition)
            onCondition: (workspace) => Fabric.isFMCContainer(workspace)
          },
          {
            id: "wiki",
            // we only want to include wiki if we are running in fabric (as they are in another perspective)
            // (must use "id" attribute for the plugin, an not href, when using onCondition)
            onCondition: (workspace) => Fabric.isFMCContainer(workspace)
          },
          {
            id: "apis.index",
            // we only want to include APIs if we are running in kubernetes (as they are in another perspective)
            onCondition: (workspace) => Kubernetes.isKubernetes(workspace)
          },
          {
            id: "grafana",
            // we only want to include Grafana if we are running in kubernetes (as they are in another perspective)
            onCondition: (workspace) => Kubernetes.isKubernetes(workspace)
          },
          {
            id: "kibana",
            // we only want to include Kibana if we are running in kubernetes (as they are in another perspective)
            onCondition: (workspace) => Kubernetes.isKubernetes(workspace)
          }
        ]
      }
    },
    limited: {
      label: "Limited",
      lastPage: "#/logs",
      isValid: (workspace) => false,
      topLevelTabs: {
        includes: [
          {
            href: "#/jmx"
          },
          {
            href: "#/camel"
          },
          {
            href: "#/activemq"
          },
          {
            href: "#/jetty"
          },
          {
            href: "#/logs"
          }
        ]
      }
    },
    website: {
      label: "WebSite",
      isValid: (workspace) => Site.sitePluginEnabled && Site.isSiteNavBarValid(),
      lastPage: "#/site/doc/index.md",
      topLevelTabs: {
        includes: [
          {
            content: "Get Started",
            title: "How to get started using hawtio",
            href: () => "#/site/doc/GetStarted.md",
            isValid: () => Site.isSiteNavBarValid()
          },
          {
            content: "FAQ",
            title: "Frequently Asked Questions",
            href: () => "#/site/FAQ.md",
            isValid: () => Site.isSiteNavBarValid()
          },
          {
            content: "User Guide",
            title: "All the docs on using hawtio",
            href: () => "#/site/book/doc/index.md",
            isValid: () => Site.isSiteNavBarValid()
          },
          {
            content: "Community",
            title: "Come on in and join our community!",
            href: () => "#/site/doc/Community.html",
            isValid: () => Site.isSiteNavBarValid()
          },
          {
            content: "Developers",
            title: "Resources for developers if you want to hack on hawtio or provide your own plugins",
            href: () => "#/site/doc/developers/index.md",
            isValid: () => Site.isSiteNavBarValid()
          },
          {
            content: "github",
            title: "Hawtio's source code and issue tracker",
            href: () => "https://github.com/hawtio/hawtio",
            isValid: () => Site.isSiteNavBarValid()
          }
        ]
      }
    }
  };

}
