  /* Utility methods, most of which are pulled from underscore.js. */
  
  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  has = function (obj, key) {
    return hasOwnProp.call(obj, key);
  };
    
  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  each = function (obj, iterator, context) {
    if (obj == null) {
      return;
    }
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) {
          return;
        }
      }
    } else {
      for (var key in obj) {
        if (has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) {
            return;
          }
        }
      }
    }
  };
      
  // Extend a given object with all the properties in passed-in object(s).
  extend = function (obj) {
    each(slice.call(arguments, 1), function (source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Returns the index at which value can be found in the array, or -1 if 
  // value is not present in the array.
  indexOf = function (array, item) {
    if (array == null) {
      return -1;
    }
    
    var i = 0, l = array.length;
    if (nativeIndexOf && array.indexOf === nativeIndexOf) {
      return array.indexOf(item);
    }
    
    for (; i < l; i++) {
      if (array[i] === item) {
        return i;
        
      }
    }
    
    return -1;
  };
  
  // Converts the stored params into parameters that will be passed
  // to a client.  Certain parameter are skipped, and others require
  // special processing before being sent to the client.
  genClientParams = function (params, excludes) {
    var 
      clientParams = {},
      param,
      paramVal;
    
    for (param in params) {
      if (!has(params, param)) {
        continue;
      }
      
      // skip params that don't go in the query string
      if (indexOf(excludes, param) !== -1) {
        continue;
      }
                
      // process all other params
      paramVal = params[param];
      if (isArray(paramVal)) {
        paramVal = paramVal.join();
      }
        
      clientParams[param] = paramVal;
    }
    
    return clientParams;
  };
  
  // converts client params to a string param1=val1&param2=val1
  genParamStr = function (params, excludes) {
    var 
      clientParams = genClientParams(params, excludes),
      parts = [],
      p;
    
    for (p in clientParams) {
      if (!has(clientParams, p)) {
        continue;
      }
      
      parts.push(p + '=' + encodeURIComponent(clientParams[p]));
    }
    
    return parts.join('&');
  };
  
  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  // switched to ===, not sure why underscore used ==
  isArray = nativeIsArray || function (obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  isObject = function (obj) {
    return obj === Object(obj);
  };
  
  // switched to ===, not sure why underscore used ==
  isString = function (obj) {
    return toString.call(obj) === '[object String]';
  };
  
  // switched to ===, not sure why underscore used ==
  isNumber = function (obj) {
    return toString.call(obj) === '[object Number]';
  };
  
  // switched to ===, not sure why underscore used ==
  if (typeof (/./) !== 'function') {
    isFunction = function (obj) {
      return typeof obj === 'function';
    };
  } else {
    isFunction = function (obj) {
      return toString.call(obj) === '[object Function]';
    };
  }
  
  // Is a given value an ejs object?
  // Yes if object and has "_type", "_self", and "toString" properties
  isEJSObject = function (obj) {
    return (isObject(obj) &&
      has(obj, '_type') &&
      has(obj, '_self') && 
      has(obj, 'toString'));
  };
  
  isQuery = function (obj) {
    return (isEJSObject(obj) && obj._type() === 'query');
  };

  isRescore = function (obj) {
    return (isEJSObject(obj) && obj._type() === 'rescore');
  };

  isFilter = function (obj) {
    return (isEJSObject(obj) && obj._type() === 'filter');
  };
  
  isFacet = function (obj) {
    return (isEJSObject(obj) && obj._type() === 'facet');
  };
  
  isScriptField = function (obj) {
    return (isEJSObject(obj) && obj._type() === 'script field');
  };
  
  isGeoPoint = function (obj) {
    return (isEJSObject(obj) && obj._type() === 'geo point');
  };
  
  isIndexedShape = function (obj) {
    return (isEJSObject(obj) && obj._type() === 'indexed shape');
  };
  
  isShape = function (obj) {
    return (isEJSObject(obj) && obj._type() === 'shape');
  };
  
  isSort = function (obj) {
    return (isEJSObject(obj) && obj._type() === 'sort');
  };
  
  isHighlight = function (obj) {
    return (isEJSObject(obj) && obj._type() === 'highlight');
  };
  
  isSuggest = function (obj) {
    return (isEJSObject(obj) && obj._type() === 'suggest');
  };
  
  isGenerator = function (obj) {
    return (isEJSObject(obj) && obj._type() === 'generator');
  };
  
  isClusterHealth = function (obj) {
    return (isEJSObject(obj) && obj._type() === 'cluster health');
  };
  
  isClusterState = function (obj) {
    return (isEJSObject(obj) && obj._type() === 'cluster state');
  };
  
  isNodeStats = function (obj) {
    return (isEJSObject(obj) && obj._type() === 'node stats');
  };
  
  isNodeInfo = function (obj) {
    return (isEJSObject(obj) && obj._type() === 'node info');
  };
  
  isRequest = function (obj) {
    return (isEJSObject(obj) && obj._type() === 'request');
  };

  isMultiSearchRequest = function (obj) {
    return (isEJSObject(obj) && obj._type() === 'multi search request');
  };
 