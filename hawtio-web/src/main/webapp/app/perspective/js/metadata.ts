module Perspective {

  export var metadata = {
    fabric: {
      label: "Fabric",
      isValid: (workspace) => Fabric.isFMCContainer(workspace),
      lastPage: "#/fabric/activeProfiles",
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
    }
  };

}
