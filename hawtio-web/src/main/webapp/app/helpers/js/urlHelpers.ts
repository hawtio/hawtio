/// <reference path="../../baseIncludes.ts"/>
module UrlHelpers {
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

  export function maybeProxy(jolokiaUrl:string, url:string) {
    if (jolokiaUrl.has('/proxy/')) {
      return join('proxy', url);
    } else {
      return url;
    }
  }

}
