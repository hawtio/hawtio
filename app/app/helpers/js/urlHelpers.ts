/// <reference path="../../baseIncludes.ts"/>
module UrlHelpers {

  var log = Logger.get("UrlHelpers");

  /**
   * Returns the URL without the starting '#' if it's there
   * @param url
   * @returns {string}
   */
  export function noHash(url:string):string {
    if (url.startsWith('#')) {
      return url.last(url.length - 1);
    } else {
      return url;
    }
  }

  export function extractPath(url:string):string {
    if (url.has('?')) {
      return url.split('?')[0];
    } else {
      return url;
    }
  }

  /**
   * Returns whether or not the context is in the supplied URL.  If the search string starts/ends with '/' then the entire URL is checked.  If the search string doesn't start with '/' then the search string is compared against the end of the URL.  If the search string starts with '/' but doesn't end with '/' then the start of the URL is checked, excluding any '#'
   * @param url
   * @param thingICareAbout
   * @returns {boolean}
   */
  export function contextActive(url:string, thingICareAbout:string):boolean {
    var cleanUrl = extractPath(url);
    if (thingICareAbout.endsWith('/') && thingICareAbout.startsWith("/")) {
      return cleanUrl.has(thingICareAbout);
    }
    if (thingICareAbout.startsWith("/")) {
      return noHash(cleanUrl).startsWith(thingICareAbout);
    }
    return cleanUrl.endsWith(thingICareAbout);
  }

  /**
   * Add the remainder to the URL string, adding a '/' if necessary
   * @param url
   * @param remainder
   * @returns {string}
   */
  export function join(url:string, remainder:string) {
    if (!remainder || remainder.length === 0) {
      return url;
    }
    var adjusted = remainder;
    if (remainder.first(1) === '/') {
      adjusted = remainder.from(1);
    }
    if (url.last(1) === '/') {
      return url + adjusted;
    } else {
      return url + '/' + adjusted;
    }
  }

  export var parseQueryString = hawtioPluginLoader.parseQueryString;

  /**
   * Apply a proxy to the supplied URL if the jolokiaUrl is using the proxy, or if the URL is for a a different host/port
   * @param jolokiaUrl
   * @param url
   * @returns {*}
   */
  export function maybeProxy(jolokiaUrl:string, url:string) {
    if (jolokiaUrl && jolokiaUrl.startsWith('proxy/')) {
      log.debug("Jolokia URL is proxied, applying proxy to: ", url);
      return join('proxy', url);
    } 
    var origin = window.location['origin'];
    if (url && (url.startsWith('http') && !url.startsWith(origin))) {
      log.debug("Url doesn't match page origin: ", origin, " applying proxy to: ", url);
      return join('proxy', url);
    }
    log.debug("No need to proxy: ", url);
    return url;
  }

  /**
   * Escape any colons in the URL for ng-resource, mostly useful for handling proxified URLs
   * @param url
   * @returns {*}
   */
  export function escapeColons(url:string):string {
    var answer = url;
    if (url.startsWith('proxy')) {
      answer = url.replace(/:/g, '\\:');
    } else {
      answer = url.replace(/:([^\/])/, '\\:$1');
    }
    return answer;
  }

}
