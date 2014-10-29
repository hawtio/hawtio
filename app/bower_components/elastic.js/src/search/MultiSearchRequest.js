  /**
    @class
    <p>The <code>MultiSearchRequest</code> object provides methods generating and 
    executing search requests.</p>

    @name ejs.MultiSearchRequest

    @desc
    <p>Provides methods for executing search requests</p>

    @param {Object} conf A configuration object containing the initilization
      parameters.  The following parameters can be set in the conf object:
        indices - single index name or array of index names
        types - single type name or array of types
        routing - the shard routing value
    */
  ejs.MultiSearchRequest = function (conf) {

    var requests, indices, types, params = {},
  
      // gernerates the correct url to the specified REST endpoint
      getRestPath = function () {
        var searchUrl = '', 
          parts = [];
      
        // join any indices
        if (indices.length > 0) {
          searchUrl = searchUrl + '/' + indices.join();
        }

        // join any types
        if (types.length > 0) {
          searchUrl = searchUrl + '/' + types.join();
        }
      
        // add _msearch endpoint
        searchUrl = searchUrl + '/_msearch';
      
        for (var p in params) {
          if (!has(params, p) || params[p] === '') {
            continue;
          }
        
          parts.push(p + '=' + encodeURIComponent(params[p]));
        }
      
        if (parts.length > 0) {
          searchUrl = searchUrl + '?' + parts.join('&');
        }
      
        return searchUrl;
      };

    /**
        The internal requests object.
        @member ejs.MultiSearchRequest
        @property {Object} requests
        */
    requests = [];

    conf = conf || {};
    // check if we are searching across any specific indeices        
    if (conf.indices == null) {
      indices = [];
    } else if (isString(conf.indices)) {
      indices = [conf.indices];
    } else {
      indices = conf.indices;
    }

    // check if we are searching across any specific types
    if (conf.types == null) {
      types = [];
    } else if (isString(conf.types)) {
      types = [conf.types];
    } else {
      types = conf.types;
    }

    // check that an index is specified when a type is
    // if not, search across _all indices
    if (indices.length === 0 && types.length > 0) {
      indices = ["_all"];
    }

    return {
    
      /**
            Sets the requests to execute.  If passed a single value it is
            added to the existing list of requests.  If passed an array of 
            requests, they overwite all existing values.

            @member ejs.MultiSearchRequest
            @param {Request || Array} r A single request or list of requests to execute.
            @returns {Object} returns <code>this</code> so that calls can be 
              chained. Returns {Array} current value not specified.
            */
      requests: function (r) {
        if (r == null) {
          return requests;
        }

        if (isRequest(r)) {
          requests.push(r);
        } else if (isArray(r)) {
          requests = r;
        } else {
          throw new TypeError('Argument must be request or array');
        }
      
        return this;
      },
    
      /**
             <p>Sets the search execution type for the request.</p>  

             <p>Valid values are:</p>
           
             <dl>
                <dd><code>dfs_query_then_fetch</code> - same as query_then_fetch, 
                  except distributed term frequencies are calculated first.</dd>
                <dd><code>dfs_query_and_fetch</code> - same as query_and_fetch,
                  except distributed term frequencies are calculated first.</dd>
                <dd><code>query_then_fetch</code> - executed against all 
                  shards, but only enough information is returned.  When ready,
                  only the relevant shards are asked for the actual document 
                  content</dd>
                <dd><code>query_and_fetch</code> - execute the query on all 
                  relevant shards and return the results, including content.</dd>
                <dd><code>scan</code> - efficiently scroll a large result set</dd>
                <dd><code>count</code> -  special search type that returns the 
                  count that matched the search request without any docs </dd>
             </dl>
           
             <p>This option is valid during the following operations:
                <code>search</code></p>

             @member ejs.MultiSearchRequest
             @param {String} t The search execution type
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      searchType: function (t) {
        if (t == null) {
          return params.search_type;
        }
      
        t = t.toLowerCase();
        if (t === 'dfs_query_then_fetch' || t === 'dfs_query_and_fetch' || 
          t === 'query_then_fetch' || t === 'query_and_fetch' || 
          t === 'scan' || t === 'count') {
          
          params.search_type = t;
        }
      
        return this;
      },

      /**
            Allows you to set the specified indices on this request object. This is the
            set of indices that will be used when the search is executed.

            @member ejs.MultiSearchRequest
            @param {Array} indexArray An array of collection names.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      indices: function (indexArray) {
        if (indexArray == null) {
          return indices;
        } else if (isString(indexArray)) {
          indices = [indexArray];
        } else if (isArray(indexArray)) {
          indices = indexArray;
        } else {
          throw new TypeError('Argument must be a string or array');
        }

        // check that an index is specified when a type is
        // if not, search across _all indices
        if (indices.length === 0 && types.length > 0) {
          indices = ["_all"];
        }

        return this;
      },

      /**
            Allows you to set the specified content-types on this request object. This is the
            set of indices that will be used when the search is executed.

            @member ejs.MultiSearchRequest
            @param {Array} typeArray An array of content-type names.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      types: function (typeArray) {
        if (typeArray == null) {
          return types;
        } else if (isString(typeArray)) {
          types = [typeArray];
        } else if (isArray(typeArray)) {
          types = typeArray;
        } else {
          throw new TypeError('Argument must be a string or array');
        }

        // check that an index is specified when a type is
        // if not, search across _all indices
        if (indices.length === 0 && types.length > 0) {
          indices = ["_all"];
        }

        return this;
      },
    
      /**
            <p>Determines what type of indices to exclude from a request.  The
            value can be one of the following:</p>

            <dl>
                <dd><code>none</code> - No indices / aliases will be excluded from a request</dd>
                <dd><code>missing</code> - Indices / aliases that are missing will be excluded from a request</dd>
            </dl>

            <p>This option is valid during the following operations:
                <code>search, search shards, count</code> and 
                <code>delete by query</code></p>
              
            @member ejs.MultiSearchRequest
            @param {String} ignoreType the type of ignore (none or missing).
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      ignoreIndices: function (ignoreType) {
        if (ignoreType == null) {
          return params.ignore_indices;
        }
    
        ignoreType = ignoreType.toLowerCase();
        if (ignoreType === 'none' || ignoreType === 'missing') {
          params.ignore_indices = ignoreType;
        }
      
        return this;
      },

      /**
            Allows you to serialize this object into a JSON encoded string.

            @member ejs.MultiSearchRequest
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        var i, len, reqs = [];
        for (i = 0, len = requests.length; i < len; i++) {
          reqs.push(requests[i]._self());
        }
        return JSON.stringify(reqs);
      },

      /**
            The type of ejs object.  For internal use only.
          
            @member ejs.MultiSearchRequest
            @returns {String} the type of object
            */
      _type: function () {
        return 'multi search request';
      },
    
      /**
            Retrieves the internal <code>query</code> object. This is typically used by
            internal API functions so use with caution.

            @member ejs.MultiSearchRequest
            @returns {String} returns this object's internal object representation.
            */
      _self: function () {
        var i, len, reqs = [];
        for (i = 0, len = requests.length; i < len; i++) {
          reqs.push(requests[i]._self());
        }
        return reqs;
      },
          
      /**
            Executes the search. 

            @member ejs.MultiSearchRequest
            @param {Function} successcb A callback function that handles the search response.
            @param {Function} errorcb A callback function that handles errors.
            @returns {Object} Returns a client specific object.
            */
      doSearch: function (successcb, errorcb) {
        var i, len, request, query, header, data = '';
    
        // make sure the user has set a client
        if (ejs.client == null) {
          throw new Error("No Client Set");
        }
     
        // generate the data
        // data consists of a header for each request + newline + request + newline
        for (i = 0, len = requests.length; i < len; i++) {
          request = requests[i];
          header = {};
        
          // add indices
          if (request.indices().length > 0) {
            header.indices = request.indices();
          }
        
          // add types
          if (request.types().length > 0) {
            header.types = request.types();
          }
        
          // add search type
          if (request.searchType() != null) {
            header.search_type = request.searchType();
          }
        
          // add preference
          if (request.preference() != null) {
            header.preference = request.preference();
          }
        
          // add routing
          if (request.routing() != null) {
            header.routing = request.routing();
          }
        
          // add ignore indices
          if (request.ignoreIndices() != null) {
            header.ignore_indices = request.ignoreIndices();
          }
        
          // add the generated header
          data = data + JSON.stringify(header) + '\n';
        
          // certain params need to be moved into the query body from request
          // params, do that here
          query = request._self();
          if (request.timeout() != null) {
            query.timeout = request.timeout();
          }
        
          // add the query to the data
          data = data + JSON.stringify(query) + '\n';
        }
      
      
        return ejs.client.post(getRestPath(), data, successcb, errorcb);
      }
    
    };
  };
