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

}