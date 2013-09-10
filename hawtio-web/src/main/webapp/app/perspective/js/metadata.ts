module Perspective {

  export var metadata = {
    fabric: {
      label: "Fabric",
      topLevelTabs: {
        includes: [
          {
            href: "#/fabric"
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