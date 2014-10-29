  /**
    @class
    <p>The <code>Request</code> object provides methods generating and 
    executing search requests.</p>

    @name ejs.Request

    @desc
    <p>Provides methods for executing search requests</p>

    @param {Object} conf A configuration object containing the initilization
      parameters.  The following parameters can be set in the conf object:
        indices - single index name or array of index names
        types - single type name or array of types
        routing - the shard routing value
    */
  ejs.Request = function (conf) {

    var query, indices, types, params = {},
    
      // gernerates the correct url to the specified REST endpoint
      getRestPath = function (endpoint) {
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
        
        // add the endpoint
        if (endpoint.length > 0 && endpoint[0] !== '/') {
          searchUrl = searchUrl + '/';
        }
        
        searchUrl = searchUrl + endpoint;
        
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
        The internal query object.
        @member ejs.Request
        @property {Object} query
        */
    query = {};

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

    if (conf.routing != null) {
      params.routing = conf.routing;
    }
    
    return {

      /**
            <p>Sets the sorting for the query.  This accepts many input formats.</p>
            
            <dl>
                <dd><code>sort()</code> - The current sorting values are returned.</dd>
                <dd><code>sort(fieldName)</code> - Adds the field to the current list of sorting values.</dd>
                <dd><code>sort(fieldName, order)</code> - Adds the field to the current list of
                    sorting with the specified order.  Order must be asc or desc.</dd>
                <dd><code>sort(ejs.Sort)</code> - Adds the Sort value to the current list of sorting values.</dd>
                <dd><code>sort(array)</code> - Replaces all current sorting values with values
                    from the array.  The array must contain only strings and Sort objects.</dd>
            </dl>

            <p>Multi-level sorting is supported so the order in which sort fields 
            are added to the query requests is relevant.</p>
            
            <p>It is recommended to use <code>Sort</code> objects when possible.</p>
            
            @member ejs.Request
            @param {String} fieldName The field to be sorted by.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      sort: function () {
        var i, len;
        
        if (!has(query, "sort")) {
          query.sort = [];
        }

        if (arguments.length === 0) {
          return query.sort;
        }
      
        // if passed a single argument
        if (arguments.length === 1) {
          var sortVal = arguments[0];
          
          if (isString(sortVal)) {
            // add  a single field name
            query.sort.push(sortVal);
          } else if (isSort(sortVal)) {
            // add the Sort object
            query.sort.push(sortVal._self());
          } else if (isArray(sortVal)) {
            // replace with all values in the array
            // the values must be a fieldName (string) or a
            // Sort object.  Any other type throws an Error.
            query.sort = [];
            for (i = 0, len = sortVal.length; i < len; i++) {
              if (isString(sortVal[i])) {
                query.sort.push(sortVal[i]);
              } else if (isSort(sortVal[i])) {
                query.sort.push(sortVal[i]._self());
              } else {
                throw new TypeError('Invalid object in array');
              }
            }
          } else {
            // Invalid object type as argument.
            throw new TypeError('Argument must be string, Sort, or array');
          } 
        } else if (arguments.length === 2) {
          // handle the case where a single field name and order are passed
          var field = arguments[0],
            order = arguments[1];
            
          if (isString(field) && isString(order)) {
            order = order.toLowerCase();
            if (order === 'asc' || order === 'desc') {
              var sortObj = {};
              sortObj[field] = {order: order};
              query.sort.push(sortObj);
            }
          }
        }

        return this;
      },

      /**
           Enables score computation and tracking during sorting.  Be default, 
           when sorting scores are not computed.

            @member ejs.Request
            @param {Boolean} trueFalse If scores should be computed and tracked.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      trackScores: function (trueFalse) {
        if (trueFalse == null) {
          return query.track_scores;
        }
      
        query.track_scores = trueFalse;
        return this;
      },
      
      /**
            Sets the number of results/documents to be returned. This is set on a per page basis.

            @member ejs.Request
            @param {Integer} s The number of results that are to be returned by the search.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      size: function (s) {
        if (s == null) {
          return query.size;
        }
      
        query.size = s;
        return this;
      },

      /**
            A timeout, bounding the request to be executed within the 
            specified time value and bail when expired. Defaults to no timeout.

            <p>This option is valid during the following operations:
                <code>search</code> and <code>delete by query</code></p>
    
            @member ejs.Request
            @param {Long} t The timeout value in milliseconds.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      timeout: function (t) {
        if (t == null) {
          return params.timeout;
        }
      
        params.timeout = t;
        return this;
      },
                  
      /**
            Sets the shard routing parameter.  Only shards matching routing
            values will be searched.  Set to an empty string to disable routing.
            Disabled by default.

            <p>This option is valid during the following operations:
                <code>search, search shards, count</code> and 
                <code>delete by query</code></p>
    
            @member ejs.Request
            @param {String} route The routing values as a comma-separated string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      routing: function (route) {
        if (route == null) {
          return params.routing;
        }
      
        params.routing = route;
        return this;
      },

      /**
             <p>Sets the replication mode.</p>  

             <p>Valid values are:</p>
             
             <dl>
                <dd><code>async</code> - asynchronous replication to slaves</dd>
                <dd><code>sync</code> - synchronous replication to the slaves</dd>
                <dd><code>default</code> - the currently configured system default.</dd> 
             </dl>
             
             <p>This option is valid during the following operations:
                <code>delete by query</code></p>

             @member ejs.Request
             @param {String} r The replication mode (async, sync, or default)
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      replication: function (r) {
        if (r == null) {
          return params.replication;
        }
        
        r = r.toLowerCase();
        if (r === 'async' || r === 'sync' || r === 'default') {
          params.replication = r;
        }
        
        return this;
      },
      
      /**
             <p>Sets the write consistency.</p>  

             <p>Valid values are:</p>
             
             <dl>
                <dd><code>one</code> - only requires write to one shard</dd>
                <dd><code>quorum</code> - requires writes to quorum <code>(N/2 + 1)</code></dd>
                <dd><code>all</code> - requires write to succeed on all shards</dd>
                <dd><code>default</code> - the currently configured system default</dd>
             </dl>
             
             <p>This option is valid during the following operations:
                <code>delete by query</code></p>

             @member ejs.Request
             @param {String} c The write consistency (one, quorum, all, or default)
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      consistency: function (c) {
        if (c == null) {
          return params.consistency;
        }
        
        c = c.toLowerCase();
        if (c === 'default' || c === 'one' || c === 'quorum' || c === 'all') {
          params.consistency = c;
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

             @member ejs.Request
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
            By default, searches return full documents, meaning every property or field.
            This method allows you to specify which fields you want returned.
            
            Pass a single field name and it is appended to the current list of
            fields.  Pass an array of fields and it replaces all existing 
            fields.

            @member ejs.Request
            @param {String || Array} s The field as a string or fields as array
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      fields: function (fieldList) {
        if (fieldList == null) {
          return query.fields;
        }
      
        if (query.fields == null) {
          query.fields = [];
        }
        
        if (isString(fieldList)) {
          query.fields.push(fieldList);
        } else if (isArray(fieldList)) {
          query.fields = fieldList;
        } else {
          throw new TypeError('Argument must be string or array');
        }

        return this;
      },

      /**
            Once a query executes, you can use rescore to run a secondary, more
            expensive query to re-order the results.

            @member ejs.Request
            @param {Rescore} r The rescore configuration.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      rescore: function (r) {
        if (r == null) {
          return query.rescore;
        }

        if (!isRescore(r)) {
          throw new TypeError('Argument must be a Rescore');
        }

        query.rescore = r._self();

        return this;
      },

      /**
            A search result set could be very large (think Google). Setting the
            <code>from</code> parameter allows you to page through the result set
            by making multiple request. This parameters specifies the starting
            result/document number point. Combine with <code>size()</code> to achieve paging.

            @member ejs.Request
            @param {Array} f The offset at which to start fetching results/documents from the result set.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      from: function (f) {
        if (f == null) {
          return query.from;
        }
        
        query.from = f;
        return this;
      },

      /**
            Allows you to set the specified query on this search object. This is the
            query that will be used when the search is executed.

            @member ejs.Request
            @param {Query} someQuery Any valid <code>Query</code> object.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      query: function (someQuery) {
        if (someQuery == null) {
          return query.query;
        }
      
        if (!isQuery(someQuery)) {
          throw new TypeError('Argument must be a Query');
        }
        
        query.query = someQuery._self();
        return this;
      },

      /**
            Allows you to set the specified indices on this request object. This is the
            set of indices that will be used when the search is executed.

            @member ejs.Request
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

            @member ejs.Request
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
            Allows you to set the specified facet on this request object. Multiple facets can
            be set, all of which will be returned when the search is executed.

            @member ejs.Request
            @param {Facet} facet Any valid <code>Facet</code> object.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      facet: function (facet) {
        if (facet == null) {
          return query.facets;
        }
      
        if (query.facets == null) {
          query.facets = {};
        }
      
        if (!isFacet(facet)) {
          throw new TypeError('Argument must be a Facet');
        }
        
        extend(query.facets, facet._self());

        return this;
      },

      /**
            Allows you to set a specified filter on this request object.

            @member ejs.Request
            @param {Object} filter Any valid <code>Filter</code> object.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      filter: function (filter) {
        if (filter == null) {
          return query.filter;
        }
      
        if (!isFilter(filter)) {
          throw new TypeError('Argument must be a Filter');
        }
        
        query.filter = filter._self();
        return this;
      },

      /**
            Performs highlighting based on the <code>Highlight</code> 
            settings.

            @member ejs.Request
            @param {Highlight} h A valid Highlight object
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      highlight: function (h) {
        if (h == null) {
          return query.highlight;
        }
      
        if (!isHighlight(h)) {
          throw new TypeError('Argument must be a Highlight object');
        }

        query.highlight = h._self();
        return this;
      },

      /**
            Allows you to set the specified suggester on this request object. 
            Multiple suggesters can be set, all of which will be returned when 
            the search is executed.  Global suggestion text can be set by 
            passing in a string vs. a <code>Suggest</code> object.

            @since elasticsearch 0.90
            
            @member ejs.Request
            @param {String || Suggest} s A valid Suggest object or a String to 
              set as the global suggest text.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      suggest: function (s) {
        if (s == null) {
          return query.suggest;
        }
      
        if (query.suggest == null) {
          query.suggest = {};
        }
      
        if (isString(s)) {
          query.suggest.text = s;
        } else if (isSuggest(s)) {
          extend(query.suggest, s._self());
        } else {
          throw new TypeError('Argument must be a string or Suggest object');
        }

        return this;
      },
      
      /**
            Computes a document property dynamically based on the supplied <code>ScriptField</code>.

            @member ejs.Request
            @param {ScriptField} oScriptField A valid <code>ScriptField</code>.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      scriptField: function (oScriptField) {
        if (oScriptField == null) {
          return query.script_fields;
        }
      
        if (query.script_fields == null) {
          query.script_fields = {};
        }
      
        if (!isScriptField(oScriptField)) {
          throw new TypeError('Argument must be a ScriptField');
        }
        
        extend(query.script_fields, oScriptField._self());
        return this;
      },

      /**
            <p>Controls the preference of which shard replicas to execute the search request on.
            By default, the operation is randomized between the each shard replicas.  The
            preference can be one of the following:</p>

            <dl>
                <dd><code>_primary</code> - the operation will only be executed on primary shards</dd>
                <dd><code>_local</code> - the operation will prefer to be executed on local shards</dd>
                <dd><code>_only_node:$nodeid</code> - the search will only be executed on node with id $nodeid</dd>
                <dd><code>custom</code> - any string, will guarentee searches always happen on same node.</dd>
            </dl>

            <p>This option is valid during the following operations:
                <code>search, search shards, </code> and <code>count</code></p>
                
            @member ejs.Request
            @param {String} perf the preference, any of <code>_primary</code>, <code>_local</code>, 
                <code>_only_:$nodeid</code>, or a custom string value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      preference: function (perf) {
        if (perf == null) {
          return params.preference;
        }
      
        params.preference = perf;
        return this;
      },

      /**
             <p>If the operation will run on the local node only</p>  

             <p>This option is valid during the following operations:
                <code>search shards</code></p>
                  
             @member ejs.Request
             @param {Boolean} trueFalse True to run on local node only
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      local: function (trueFalse) {
        if (trueFalse == null) {
          return params.local;
        }
      
        params.local = trueFalse;
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
                
            @member ejs.Request
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
            Boosts hits in the specified index by the given boost value.

            @member ejs.Request
            @param {String} index the index to boost
            @param {Double} boost the boost value
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      indexBoost: function (index, boost) {
        if (query.indices_boost == null) {
          query.indices_boost = {};
        }

        if (arguments.length === 0) {
          return query.indices_boost;
        }
      
        query.indices_boost[index] = boost;
        return this;
      },

      /**
            Enable/Disable explanation of score for each search result.

            @member ejs.Request
            @param {Boolean} trueFalse true to enable, false to disable
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      explain: function (trueFalse) {
        if (trueFalse == null) {
          return query.explain;
        } 
        
        query.explain = trueFalse;
        return this;
      },

      /**
            Enable/Disable returning version number for each search result.

            @member ejs.Request
            @param {Boolean} trueFalse true to enable, false to disable
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      version: function (trueFalse) {
        if (trueFalse == null) {
          return query.version;
        }
        
        query.version = trueFalse;
        return this;
      },

      /**
            Filters out search results will scores less than the specified minimum score.

            @member ejs.Request
            @param {Double} min a positive <code>double</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      minScore: function (min) {
        if (min == null) {
          return query.min_score;
        }
        
        query.min_score = min;
        return this;
      },

      /**
            Allows you to serialize this object into a JSON encoded string.

            @member ejs.Request
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(query);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.Request
            @returns {String} the type of object
            */
      _type: function () {
        return 'request';
      },
      
      /**
            Retrieves the internal <code>query</code> object. This is typically used by
            internal API functions so use with caution.

            @member ejs.Request
            @returns {String} returns this object's internal object representation.
            */
      _self: function () {
        return query;
      },

      /**
            Executes a delete by query request using the current query.
            
            @member ejs.Request
            @param {Function} successcb A callback function that handles the response.
            @param {Function} errorcb A callback function that handles errors.
            @returns {Object} Returns a client specific object.
            */
      doDeleteByQuery: function (successcb, errorcb) {
        var queryData = JSON.stringify(query.query);
      
        // make sure the user has set a client
        if (ejs.client == null) {
          throw new Error("No Client Set");
        }
        
        return ejs.client.del(getRestPath('_query'), queryData, successcb, errorcb);
      },

      /**
            Executes a count request using the current query.
            
            @member ejs.Request
            @param {Function} successcb A callback function that handles the count response.
            @param {Function} errorcb A callback function that handles errors.
            @returns {Object} Returns a client specific object.
            */
      doCount: function (successcb, errorcb) {
        var queryData = JSON.stringify(query.query);
      
        // make sure the user has set a client
        if (ejs.client == null) {
          throw new Error("No Client Set");
        }
        
        return ejs.client.post(getRestPath('_count'), queryData, successcb, errorcb);
      },
            
      /**
            Executes the search. 

            @member ejs.Request
            @param {Function} successcb A callback function that handles the search response.
            @param {Function} errorcb A callback function that handles errors.
            @returns {Object} Returns a client specific object.
            */
      doSearch: function (successcb, errorcb) {
        var queryData = JSON.stringify(query);
      
        // make sure the user has set a client
        if (ejs.client == null) {
          throw new Error("No Client Set");
        }
        
        return ejs.client.post(getRestPath('_search'), queryData, successcb, errorcb);
      },
      
      /**
            Executes the search request as configured but only returns back 
            the shards and nodes that the search is going to execute on.  This
            is a cluster admin method. 

            @member ejs.Request
            @param {Function} successcb A callback function that handles the response.
            @param {Function} errorcb A callback function that handles errors.
            @returns {Object} Returns a client specific object.
            */
      doSearchShards: function (successcb, errorcb) {
        // make sure the user has set a client
        if (ejs.client == null) {
          throw new Error("No Client Set");
        }

        // we don't need to send in the body data, just use empty string
        return ejs.client.post(getRestPath('_search_shards'), '', successcb, errorcb);
      }
      
    };
  };
