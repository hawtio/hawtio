/**
 * @module Perspective
 */
module Perspective {

  export var containerPerspectiveEnabled = true;

  /**
   * Configuration for the perspective plugin that defines what tabs are in which perspectives
   * @property metadata
   * @for Perspective
   * @type {any}
   */
  export var metadata = {
    fabric: {
      label: "Fabric",
      isValid: (workspace) => Fabric.isFMCContainer(workspace),
      lastPage: "#/fabric/containers",
      topLevelTabs: {
        includes: [
          {
            href: "#/fabric"
          },
          {
            href: "#/wiki/branch/"
          },
          {
            href: "#/wiki/profile"
          },
          {
            href: "#/dashboard"
          },
          {
            href: "#/health"
          },
          {
            id: "fabric.insight"
          }
        ]
      }
    },
    insight: {
      label: "Insight",
      isValid: (workspace) => Insight.hasInsight(workspace),
      topLevelTabs: {
        includes: [
          {
            href: "#/kibanalogs"
          },
          {
            href: "#/insight"
          },
          {
            href: "#/kibanacamel"
          },
          {
            href: "#/camin"
          },
          {
            href: "#/eshead"
          }
        ]
      }
    },
    container: {
      label: "Container",
      lastPage: "#/logs",
      isValid: (workspace) => workspace && workspace.tree && workspace.tree.children && workspace.tree.children.length,
      topLevelTabs: {
        includes: [
          {
            href: "#/health",
            // we only want health plugin if we are not running in Fabric
            onCondition: (workspace) => !Fabric.isFMCContainer(workspace)
          }
        ],
        excludes: [
          {
            href: "#/fabric"
          },
          {
            href: "#/insight"
          },
          {
            href: "#/camin"
          },
          {
            href: "#/kibanalogs"
          },
          {
            href: "#/kibanacamel"
          },
          {
            href: "#/eshead"
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
