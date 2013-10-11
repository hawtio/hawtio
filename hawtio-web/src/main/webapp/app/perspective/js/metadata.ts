module Perspective {

  export var metadata = {
    fabric: {
      label: "Fabric",
      isValid: (workspace) => Fabric.hasFabric(workspace),
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
