  /**
    @class
    <p>The <code>ClusterHealth</code> object provides an interface for accessing
    the health information of your cluster.</p>

    @name ejs.ClusterHealth

    @desc Access the health of your cluster.
    */
  ejs.ClusterHealth = function () {

    var 
      params = {},
      paramExcludes = ['indices'];
  
    return {
  
      /**
             <p>Set's the indices to get the health information for.  If a 
             single value is passed in it will be appended to the current list 
             of indices.  If an array is passed in it will replace all existing 
             indices.</p>  
         
             @member ejs.ClusterHealth
             @param {String || Array} i An index name or list of index names.
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      indices: function (i) {
        if (params.indices == null) {
          params.indices = [];
        }
    
        if (i == null) {
          return params.indices;
        }
    
        if (isString(i)) {
          params.indices.push(i);
        } else if (isArray(i)) {
          params.indices = i;
        } else {
          throw new TypeError('Argument must be string or array');
        }
    
        return this;
      },
  
      /**
             <p>If the operation will run on the local node only</p>  

             @member ejs.ClusterHealth
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
             <p>Set's a timeout for the response from the master node.</p>  

             @member ejs.ClusterHealth
             @param {String} length The amount of time after which the operation
              will timeout.
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      masterTimeout: function (length) {
        if (length == null) {
          return params.master_timeout;
        }
    
        params.master_timeout = length;
        return this;
      },
    
      /**
             <p>Set's a timeout to use during any of the waitFor* options.</p>  

             @member ejs.ClusterHealth
             @param {String} length The amount of time after which the operation
              will timeout.
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      timeout: function (length) {
        if (length == null) {
          return params.timeout;
        }
    
        params.timeout = length;
        return this;
      },
  
      /**
             <p>Set the cluster status to wait for (or until timeout).  Valid 
             values are:</p>  
         
             <dl>
                 <dd><code>green</code></dd>
                 <dd><code>yellow</code></dd>
                 <dd><code>red</code></dd>
             </dl>

             @member ejs.ClusterHealth
             @param {String} status The status to wait for (green, yellow, or red).
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      waitForStatus: function (status) {
        if (status == null) {
          return params.wait_for_status;
        }
    
        status = status.toLowerCase();
        if (status === 'green' || status === 'yellow' || status === 'red') {
          params.wait_for_status = status;
        }
      
        return this;
      },
    
      /**
             <p>Set's the number of shards that can be relocating before
             proceeding with the operation.  Typically set to 0 meaning we
             must wait for all shards to be done relocating.</p>  

             @member ejs.ClusterHealth
             @param {Integer} num The number of acceptable relocating shards.
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      waitForRelocatingShards: function (num) {
        if (num == null) {
          return params.wait_for_relocating_shards;
        }
    
        params.wait_for_relocating_shards = num;
        return this;
      },
    
      /**
             <p>Set's the number of shards that should be active before
             proceeding with the operation.</p>  

             @member ejs.ClusterHealth
             @param {Integer} num The number of active shards.
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      waitForActiveShards: function (num) {
        if (num == null) {
          return params.wait_for_active_shards;
        }
    
        params.wait_for_active_shards = num;
        return this;
      },
    
      /**
             <p>Set's the number of nodes that must be available before
             proceeding with the operation.  The value can be specified
             as an integer or as values such as >=N, <=N, >N, <N, ge(N), 
             le(N), gt(N) and lt(N).</p>  

             @member ejs.ClusterHealth
             @param {String} num The number of avaiable nodes
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      waitForNodes: function (num) {
        if (num == null) {
          return params.wait_for_nodes;
        }
    
        params.wait_for_nodes = num;
        return this;
      },
    
      /**
             <p>Set the level of details for the operation.  Possible values
             for the level are:</p>  
         
             <dl>
                 <dd><code>cluster</code></dd>
                 <dd><code>indices</code></dd>
                 <dd><code>shards</code></dd>
             </dl>

             @member ejs.ClusterHealth
             @param {String} l The details level (cluster, indices, or shards)
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      level: function (l) {
        if (l == null) {
          return params.level;
        }
    
        l = l.toLowerCase();
        if (l === 'cluster' || l === 'indices' || l === 'shards') {
          params.level = l;
        }
      
        return this;
      },
    
      /**
            <p>Allows you to serialize this object into a JSON encoded string.</p>

            @member ejs.ClusterHealth
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(params);
      },
  
      /**
            <p>The type of ejs object.  For internal use only.</p>
        
            @member ejs.ClusterHealth
            @returns {String} the type of object
            */
      _type: function () {
        return 'cluster health';
      },
  
      /**
            <p>Retrieves the internal <code>document</code> object. This is 
            typically used by internal API functions so use with caution.</p>

            @member ejs.ClusterHealth
            @returns {Object} returns this object's internal object.
            */
      _self: function () {
        return params;
      },
  
      /**
            <p>Retrieves very simple status on the health of the cluster.</p>

            @member ejs.ClusterHealth
            @param {Function} successcb A callback function that handles the response.
            @param {Function} errorcb A callback function that handles errors.
            @returns {Object} The return value is dependent on client implementation.
            */
      doHealth: function (successcb, errorcb) {
        // make sure the user has set a client
        if (ejs.client == null) {
          throw new Error("No Client Set");
        }
    
        var url = '/_cluster/health';
      
        if (params.indices && params.indices.length > 0) {
          url = url + '/' + params.indices.join();
        }
      
        return ejs.client.get(url, genClientParams(params, paramExcludes), 
                                                          successcb, errorcb);
      }
    
    };
  };