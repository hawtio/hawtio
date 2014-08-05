/// <reference path="../../baseIncludes.ts"/>
module UrlHelpers {

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

  /**
   * Returns whether or not the context is in the supplied URL.  If the search string starts/ends with '/' then the entire URL is checked.  If the search string doesn't start with '/' then the search string is compared against the end of the URL.  If the search string starts with '/' but doesn't end with '/' then the start of the URL is checked, excluding any '#'
   * @param url
   * @param thingICareAbout
   * @returns {boolean}
   */
  export function contextActive(url:string, thingICareAbout:string):boolean {
    if (thingICareAbout.endsWith('/') && thingICareAbout.startsWith("/")) {
      return url.has(thingICareAbout);
    }
    if (thingICareAbout.startsWith("/")) {
      return noHash(url).startsWith(thingICareAbout);
    }
    return url.endsWith(thingICareAbout);
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

  /**
   * Apply a proxy to the supplied URL if the jolokiaUrl is using the proxy
   * @param jolokiaUrl
   * @param url
   * @returns {*}
   */
  export function maybeProxy(jolokiaUrl:string, url:string) {
    if (jolokiaUrl.has('/proxy/')) {
      return join('proxy', url);
    } else {
      return url;
    }
  }

}
