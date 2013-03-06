module JBoss {

    export function cleanWebAppName(name: string) {
        // JBoss may include .war as the application name, so remove that
        if (name && name.lastIndexOf(".war") > -1) {
            return name.replace(".war", "")
        } else {
            return name
        }
    }

    export function cleanContextPath(contextPath: string) {
        if (contextPath) {
            return "/" + cleanWebAppName(contextPath)
        } else {
            return "";
        }
    }

    export function iconClass(state:string) {
      if (state) {
        switch (state.toString().toLowerCase()) {
          case 'started':
            return "green icon-play";
          case 'ok':
            return "green icon-play";
          case 'true':
            return "green icon-play";
        }
      }
      return "red icon-stop";
    }

}