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
          }
        ]
      }
    },
    local: {
      label: "Local JVM",
      topLevelTabs: {
        excludes: [
          {
            href: "#/fabric"
          }
        ]
      }
    }
  };

}
