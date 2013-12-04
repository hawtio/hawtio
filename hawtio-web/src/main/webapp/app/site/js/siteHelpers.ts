/**
 * @module Site
 */
module Site {

  export var sitePluginEnabled = false;

  export function isSiteNavBarValid() {
    return Site.sitePluginEnabled;
  }
}
