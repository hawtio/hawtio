module Perspective {

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
      topLevelTabs: {
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
    website: {
      label: "WebSite",
      lastPage: "#/site/doc/index.md",
      topLevelTabs: {
        includes: [
          {
            content: "Getting Started",
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
            href: () => "#/site/doc/index.md",
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
