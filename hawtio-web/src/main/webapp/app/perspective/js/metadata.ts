module Perspective {

  export var metadata = {
    fabric: {
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